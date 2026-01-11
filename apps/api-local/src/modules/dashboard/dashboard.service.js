import { pool } from "../../db/pool.js";

export async function getResumenDashboard() {
  const { rows: [ventasHoy] } = await pool.query(`
    SELECT
      COALESCE(SUM(total), 0) AS total,
      COALESCE(COUNT(*), 0) AS cantidad
    FROM venta
    WHERE estado = 'PAGADA'
      AND fecha_creacion >= date_trunc('day', now())
      AND fecha_creacion <  date_trunc('day', now()) + interval '1 day'
  `);

  const { rows: [ventasSemana] } = await pool.query(`
    SELECT COALESCE(SUM(total), 0) AS total
    FROM venta
    WHERE estado = 'PAGADA'
      AND fecha_creacion >= now() - interval '7 days'
  `);

  const { rows: [cajasAbiertas] } = await pool.query(`
    SELECT COALESCE(COUNT(*), 0) AS cantidad
    FROM caja_sesion
    WHERE estado = 'ABIERTA'
  `);

  // Como no hay "stock_minimo" todavía, definimos stock en cero como "cantidad = 0"
  const { rows: [stockCero] } = await pool.query(`
    SELECT COALESCE(COUNT(*), 0) AS cantidad
    FROM stock_saldo
    WHERE cantidad = 0
  `);

  const { rows: [ultimaVenta] } = await pool.query(`
    SELECT numero_venta, total, estado, fecha_creacion
    FROM venta
    ORDER BY fecha_creacion DESC
    LIMIT 1
  `);

  return {
    ventas_hoy_total: Number(ventasHoy.total),
    ventas_hoy_cantidad: Number(ventasHoy.cantidad),
    ventas_semana_total: Number(ventasSemana.total),
    cajas_abiertas: Number(cajasAbiertas.cantidad),
    stock_en_cero: Number(stockCero.cantidad),
    ultima_venta: ultimaVenta || null,
  };
}
