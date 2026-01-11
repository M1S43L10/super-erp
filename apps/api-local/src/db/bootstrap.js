import "./env.js";
import pg from "pg";
const { Client } = pg;

function sqlStringLiteral(value) {
  // Escapa comillas simples:  O'Brien -> 'O''Brien'
  return "'" + String(value).replace(/'/g, "''") + "'";
}


function assertSafeIdent(name, label) {
  // nombres simples tipo supererp / super_erp_local
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    throw new Error(`${label} inválido: ${name}`);
  }
}

async function roleExists(client, roleName) {
  const r = await client.query("SELECT 1 FROM pg_roles WHERE rolname = $1", [
    roleName,
  ]);
  return r.rowCount > 0;
}

async function databaseExists(client, dbName) {
  const r = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [
    dbName,
  ]);
  return r.rowCount > 0;
}

export async function ensureDatabaseAndRole() {
  const admin = new Client({
    host: process.env.PG_ADMIN_HOST,
    port: Number(process.env.PG_ADMIN_PORT || 5432),
    database: process.env.PG_ADMIN_DB || "postgres",
    user: process.env.PG_ADMIN_USER,
    password: process.env.PG_ADMIN_PASS,
  });

  const appUser = process.env.PG_APP_USER;
  const appPass = process.env.PG_APP_PASS;
  const appDb = process.env.PG_APP_DB;

  assertSafeIdent(appUser, "PG_APP_USER");
  assertSafeIdent(appDb, "PG_APP_DB");

  await admin.connect();

  try {
    // 1) Crear rol si no existe
    const hasRole = await roleExists(admin, appUser);
    if (!hasRole) {
      // CREATE ROLE no acepta parámetros para el identificador, por eso validamos y concatenamos
      await admin.query(`CREATE USER ${appUser} WITH PASSWORD ${sqlStringLiteral(appPass)}`);
      console.log(`[BOOTSTRAP] Rol creado: ${appUser}`);
    } else {
      console.log(`[BOOTSTRAP] Rol OK: ${appUser}`);
    }

    // 2) Crear DB si no existe
    const hasDb = await databaseExists(admin, appDb);

    if (!hasDb) {
      try {
        await admin.query(`CREATE DATABASE ${appDb} OWNER ${appUser}`);
        console.log(`[BOOTSTRAP] DB creada: ${appDb} (owner=${appUser})`);
      } catch (e) {
        // 23505 = unique_violation (ya existe)
        if (e?.code === "23505") {
          console.log(`[BOOTSTRAP] DB ya existía: ${appDb} (ignorando)`);
        } else {
          throw e;
        }
      }
    } else {
      console.log(`[BOOTSTRAP] DB OK: ${appDb}`);
    }
  } finally {
    await admin.end();
  }
}
