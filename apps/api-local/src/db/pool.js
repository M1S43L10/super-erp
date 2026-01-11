import "./env.js";
import pg from "pg";
const { Pool } = pg;

export const pool = new Pool({
  host: process.env.PG_APP_HOST,
  port: Number(process.env.PG_APP_PORT || 5432),
  database: process.env.PG_APP_DB,
  user: process.env.PG_APP_USER,
  password: process.env.PG_APP_PASS,

  max: 20,                    // conexiones simultáneas (17 cajas OK)
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});
