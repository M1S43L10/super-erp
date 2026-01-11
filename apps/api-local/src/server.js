import "dotenv/config";

import express from "express";
import cors from "cors";

import { ensureDatabaseAndRole } from "./db/bootstrap.js";
import { pool } from "./db/pool.js";
import { runMigrations } from "./db/migrate.js";
import { seedAdmin } from "./db/seedAdmin.js";
import posRoutes from "./modules/pos/pos.routes.js";
import productosRoutes from "./modules/productos/productos.routes.js";
import stockRoutes from "./modules/stock/stock.routes.js";
import cajerosRoutes from "./modules/cajeros/cajeros.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";



const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/pos", posRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/cajeros", cajerosRoutes);
app.use("/api/dashboard", dashboardRoutes);


app.get("/api/health", async (_req, res) => {
  try {
    const r = await pool.query("SELECT NOW() as now");
    res.json({ status: "OK", service: "api-local", db_time: r.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: "ERROR", error: err.message });
  }
});


const PORT = process.env.PORT || 3001;

async function start() {
  await ensureDatabaseAndRole();
  await runMigrations();
  await seedAdmin();

  app.listen(PORT, () =>
    console.log(`API LOCAL escuchando en puerto ${PORT}`)
  );
}


start().catch((err) => {
  console.error("[FATAL]", err);
  process.exit(1);
});
