import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./pool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getApplied() {
  const r = await pool.query(`SELECT id FROM schema_migrations`);
  return new Set(r.rows.map((x) => x.id));
}

async function applyMigration(id, sql) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query(`INSERT INTO schema_migrations(id) VALUES ($1)`, [id]);
    await client.query("COMMIT");
    console.log(`[MIGRATE] OK ${id}`);
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(`[MIGRATE] FAIL ${id}: ${e.message}`);
    throw e;
  } finally {
    client.release();
  }
}

export async function runMigrations() {
  // 1) garantizar tabla schema_migrations (por si la 001 no corrió aún)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const applied = await getApplied();

  // src/db -> api-local -> db/migrations
  const migrationsDir = path.resolve(__dirname, "../../db/migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const f of files) {
    if (!applied.has(f)) {
      const sql = fs.readFileSync(path.join(migrationsDir, f), "utf-8");
      await applyMigration(f, sql);
    } else {
      console.log(`[MIGRATE] SKIP ${f}`);
    }
  }
}
