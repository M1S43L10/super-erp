import { pool } from "../../db/pool.js";

function dinero(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) throw new Error("Importe inválido");
  return Math.round(x * 100) / 100;
}

export async function crearVentaTx(input) {
  if (!input?.items?.length) {
    throw new Error("La venta debe tener items");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Crear venta
    const ventaRes = await client.query(
      `
      INSERT INTO venta (
        sucursal_id,
        terminal_id,
        caja_sesion_id,
        estado,
        subtotal,
        descuento_total,
        total
      )
      VALUES ($1,$2,$3,'ABIERTA',0,0,0)
      RETURNING id, numero_venta, fecha_creacion
      `,
      [
        input.sucursal_id ?? null,
        input.terminal_id ?? null,
        input.caja_sesion_id ?? null
      ]
    );

    const venta = ventaRes.rows[0];

    let subtotal = 0;
    let descuentoTotal = 0;

    // 2️⃣ Items
    for (const it of input.items) {
      const cantidad = Number(it.cantidad ?? 1);
      const precio = dinero(it.precio_unitario ?? 0);
      const descuento = dinero(it.descuento ?? 0);

      const totalLinea = dinero(cantidad * precio - descuento);

      subtotal += dinero(cantidad * precio);
      descuentoTotal += descuento;

      await client.query(
        `
        INSERT INTO venta_item (
          venta_id,
          producto_id,
          codigo_barra,
          descripcion,
          cantidad,
          precio_unitario,
          descuento,
          total
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        `,
        [
          venta.id,
          it.producto_id ?? null,
          it.codigo_barra ?? null,
          it.descripcion,
          cantidad,
          precio,
          descuento,
          totalLinea
        ]
      );
    }

    const total = dinero(subtotal - descuentoTotal);

    // 3️⃣ Pagos
    let pagado = 0;

    if (Array.isArray(input.pagos)) {
      for (const p of input.pagos) {
        const importe = dinero(p.importe);
        pagado += importe;

        await client.query(
          `
          INSERT INTO pago (
            venta_id,
            metodo,
            importe,
            moneda,
            proveedor,
            id_pago_externo,
            estado
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7)
          `,
          [
            venta.id,
            p.metodo,
            importe,
            p.moneda ?? "ARS",
            p.proveedor ?? null,
            p.id_pago_externo ?? null,
            p.estado ?? "APROBADO"
          ]
        );
      }
    }

    const estadoVenta = pagado >= total && total > 0 ? "PAGADA" : "ABIERTA";

    // 4️⃣ Actualizar totales
    await client.query(
      `
      UPDATE venta
      SET subtotal=$2, descuento_total=$3, total=$4, estado=$5
      WHERE id=$1
      `,
      [venta.id, subtotal, descuentoTotal, total, estadoVenta]
    );

    // 5️⃣ Outbox (offline-first)
    await client.query(
      `
      INSERT INTO outbox_event (
        branch_id,
        event_type,
        aggregate_type,
        aggregate_id,
        payload
      )
      VALUES ($1,'VENTA_CREADA','venta',$2,$3)
      `,
      [
        input.sucursal_id ?? null,   // lo guardamos igual, solo cambia el nombre de columna en outbox
        String(venta.id),
        {
          numero_venta: venta.numero_venta,
          total,
          estado: estadoVenta
        }
      ]
    );


    await client.query("COMMIT");

    return {
      estado: "OK",
      venta: {
        id: venta.id,
        numero_venta: venta.numero_venta,
        total,
        estado: estadoVenta
      }
    };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function abrirCajaTx(input) {
  if (!input?.usuario_apertura) throw new Error("usuario_apertura es requerido");

  const importeApertura = dinero(input.importe_apertura ?? 0);

  const r = await pool.query(
    `
    INSERT INTO caja_sesion (
      sucursal_id,
      terminal_id,
      usuario_apertura,
      importe_apertura,
      estado
    )
    VALUES ($1,$2,$3,$4,'ABIERTA')
    RETURNING id, estado, fecha_apertura
    `,
    [
      input.sucursal_id ?? null,
      input.terminal_id ?? null,
      input.usuario_apertura,
      importeApertura
    ]
  );

  // outbox opcional (te lo dejo ya listo)
  await pool.query(
    `
    INSERT INTO outbox_event (branch_id, event_type, aggregate_type, aggregate_id, payload)
    VALUES ($1,'CAJA_ABIERTA','caja_sesion',$2,$3)
    `,
    [
      input.sucursal_id ?? null,
      String(r.rows[0].id),
      { importe_apertura: importeApertura, usuario: input.usuario_apertura }
    ]
  );

  return { estado: "OK", caja_sesion: r.rows[0] };
}

export async function cerrarCajaTx(input) {
  if (!input?.caja_sesion_id) throw new Error("caja_sesion_id es requerido");

  const importeCierre = dinero(input.importe_cierre ?? 0);

  const r = await pool.query(
    `
    UPDATE caja_sesion
    SET estado='CERRADA', fecha_cierre=NOW(), importe_cierre=$2
    WHERE id=$1 AND estado='ABIERTA'
    RETURNING id, estado, fecha_apertura, fecha_cierre, importe_cierre
    `,
    [input.caja_sesion_id, importeCierre]
  );

  if (r.rowCount === 0) {
    throw new Error("Caja no encontrada o ya está cerrada");
  }

  await pool.query(
    `
    INSERT INTO outbox_event (branch_id, event_type, aggregate_type, aggregate_id, payload)
    VALUES ($1,'CAJA_CERRADA','caja_sesion',$2,$3)
    `,
    [
      null,
      String(r.rows[0].id),
      { importe_cierre: importeCierre }
    ]
  );

  return { estado: "OK", caja_sesion: r.rows[0] };
}
