import { pool } from "../../db/pool.js";

function num(n, label) {
  const x = Number(n);
  if (!Number.isFinite(x)) throw new Error(`${label} inválido`);
  return x;
}

export async function ajusteStockTx(input) {
  const sucursal_id = input?.sucursal_id ?? null;
  const producto_id = input?.producto_id;
  const cantidad = num(input?.cantidad, "cantidad"); // cantidad del ajuste (puede ser + o -)
  const referencia = input?.referencia ?? "AJUSTE_MANUAL";

  if (!producto_id) throw new Error("producto_id es requerido");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1) Crear movimiento
    const mov = await client.query(
      `
      INSERT INTO stock_movimiento (sucursal_id, tipo, referencia_tipo, referencia_id)
      VALUES ($1, 'AJUSTE', $2, NULL)
      RETURNING id, creado_en
      `,
      [sucursal_id, referencia]
    );

    // 2) Insert item movimiento
    await client.query(
      `
      INSERT INTO stock_movimiento_item (movimiento_id, producto_id, cantidad)
      VALUES ($1, $2, $3)
      `,
      [mov.rows[0].id, producto_id, cantidad]
    );

    // 3) Upsert saldo
    const saldo = await client.query(
      `
      INSERT INTO stock_saldo (sucursal_id, producto_id, cantidad)
      VALUES ($1, $2, $3)
      ON CONFLICT (sucursal_id, producto_id)
      DO UPDATE SET cantidad = stock_saldo.cantidad + EXCLUDED.cantidad
      RETURNING id, sucursal_id, producto_id, cantidad
      `,
      [sucursal_id, producto_id, cantidad]
    );

    // 4) Outbox
    await client.query(
      `
      INSERT INTO outbox_event (branch_id, event_type, aggregate_type, aggregate_id, payload)
      VALUES ($1,'STOCK_AJUSTADO','producto',$2,$3)
      `,
      [
        sucursal_id,
        String(producto_id),
        { cantidad, referencia, saldo: saldo.rows[0].cantidad },
      ]
    );

    await client.query("COMMIT");

    return { estado: "OK", saldo: saldo.rows[0], movimiento_id: mov.rows[0].id };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function saldoStock(query) {
  const sucursal_id = query?.sucursal_id ?? null;
  const producto_id = query?.producto_id ?? null;

  if (!producto_id) throw new Error("producto_id es requerido");

  const r = await pool.query(
    `
    SELECT sucursal_id, producto_id, cantidad
    FROM stock_saldo
    WHERE sucursal_id IS NOT DISTINCT FROM $1
      AND producto_id = $2
    `,
    [sucursal_id, producto_id]
  );

  return { estado: "OK", saldo: r.rows[0] ?? { sucursal_id, producto_id, cantidad: 0 } };
}
