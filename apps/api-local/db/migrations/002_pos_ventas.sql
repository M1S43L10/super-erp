-- 002_pos_ventas.sql
-- POS mínimo en español

CREATE TABLE IF NOT EXISTS caja_sesion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sucursal_id UUID NULL,
  terminal_id UUID NULL,

  usuario_apertura TEXT NOT NULL,
  fecha_apertura TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_cierre TIMESTAMPTZ NULL,

  importe_apertura NUMERIC(12,2) NOT NULL DEFAULT 0,
  importe_cierre NUMERIC(12,2) NULL,

  estado TEXT NOT NULL DEFAULT 'ABIERTA' -- ABIERTA | CERRADA
);

CREATE INDEX IF NOT EXISTS idx_caja_sesion_estado ON caja_sesion(estado);

CREATE TABLE IF NOT EXISTS venta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sucursal_id UUID NULL,
  terminal_id UUID NULL,

  caja_sesion_id UUID NULL REFERENCES caja_sesion(id),

  numero_venta BIGINT GENERATED ALWAYS AS IDENTITY,
  estado TEXT NOT NULL DEFAULT 'ABIERTA', -- ABIERTA | PAGADA | ANULADA

  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  descuento_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,

  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS venta_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venta_id UUID NOT NULL REFERENCES venta(id) ON DELETE CASCADE,

  producto_id TEXT NULL,
  codigo_barra TEXT NULL,

  descripcion TEXT NOT NULL,
  cantidad NUMERIC(12,3) NOT NULL DEFAULT 1,
  precio_unitario NUMERIC(12,2) NOT NULL DEFAULT 0,

  descuento NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pago (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venta_id UUID NOT NULL REFERENCES venta(id) ON DELETE CASCADE,

  metodo TEXT NOT NULL,                  -- EFECTIVO | TARJETA | QR | TRANSFERENCIA
  importe NUMERIC(12,2) NOT NULL,
  moneda TEXT NOT NULL DEFAULT 'ARS',

  proveedor TEXT NULL,                   -- clover | mercadopago | posnet
  id_pago_externo TEXT NULL,
  estado TEXT NOT NULL DEFAULT 'APROBADO',

  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
