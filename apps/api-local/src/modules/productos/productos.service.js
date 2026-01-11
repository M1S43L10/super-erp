import { pool } from "../../db/pool.js";

function num(n, label) {
  const x = Number(n);
  if (!Number.isFinite(x)) throw new Error(`${label} inválido`);
  return x;
}

export async function crearProductoTx(input) {
  if (!input?.descripcion) throw new Error("descripcion es requerido");

  const codigo = input.codigo ?? null;
  const descripcion = String(input.descripcion).trim();
  const activo = input.activo ?? true;

  const r = await pool.query(
    `
    INSERT INTO producto (codigo, descripcion, activo)
    VALUES ($1,$2,$3)
    RETURNING id, codigo, descripcion, activo, creado_en
    `,
    [codigo, descripcion, activo]
  );

  return { estado: "OK", producto: r.rows[0] };
}

export async function buscarProductos(query) {
  const buscar = (query?.buscar ?? "").toString().trim();
  const limit = Math.min(Number(query?.limit ?? 50) || 50, 200);
  const offset = Number(query?.offset ?? 0) || 0;

  // búsqueda por descripcion o codigo o codigo_barra
  const r = await pool.query(
    `
    SELECT
      p.id, p.codigo, p.descripcion, p.activo, p.creado_en,
      (SELECT pp.precio
         FROM producto_precio pp
        WHERE pp.producto_id = p.id
        ORDER BY pp.vigente_desde DESC
        LIMIT 1) AS precio_actual
    FROM producto p
    WHERE
      ($1 = '' OR
       p.descripcion ILIKE '%' || $1 || '%' OR
       p.codigo = $1 OR
       EXISTS (
         SELECT 1 FROM producto_codigo_barra pcb
          WHERE pcb.producto_id = p.id AND pcb.codigo_barra = $1
       ))
    ORDER BY p.descripcion ASC
    LIMIT $2 OFFSET $3
    `,
    [buscar, limit, offset]
  );

  return { estado: "OK", items: r.rows, limit, offset };
}

export async function agregarCodigoBarraTx(productoId, body) {
  const codigo_barra = String(body?.codigo_barra ?? "").trim();
  if (!codigo_barra) throw new Error("codigo_barra es requerido");

  // Evitar duplicados globales por UNIQUE(codigo_barra)
  const r = await pool.query(
    `
    INSERT INTO producto_codigo_barra (producto_id, codigo_barra)
    VALUES ($1,$2)
    RETURNING id, producto_id, codigo_barra
    `,
    [productoId, codigo_barra]
  );

  return { estado: "OK", codigo_barra: r.rows[0] };
}

export async function agregarPrecioTx(productoId, body) {
  const precio = num(body?.precio, "precio");
  const moneda = (body?.moneda ?? "ARS").toString().trim() || "ARS";

  const r = await pool.query(
    `
    INSERT INTO producto_precio (producto_id, moneda, precio)
    VALUES ($1,$2,$3)
    RETURNING id, producto_id, moneda, precio, vigente_desde
    `,
    [productoId, moneda, precio]
  );

  // (Opcional) registrar evento outbox para sync de precios
  await pool.query(
    `
    INSERT INTO outbox_event (branch_id, event_type, aggregate_type, aggregate_id, payload)
    VALUES ($1,'PRECIO_ACTUALIZADO','producto',$2,$3)
    `,
    [null, String(productoId), { moneda, precio }]
  );

  return { estado: "OK", precio: r.rows[0] };
}
