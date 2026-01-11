-- 003_productos_stock.sql
-- Productos + Stock mínimo

CREATE TABLE IF NOT EXISTS producto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NULL,             -- interno
  descripcion TEXT NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS producto_codigo_barra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID NOT NULL REFERENCES producto(id) ON DELETE CASCADE,
  codigo_barra TEXT NOT NULL,
  UNIQUE (codigo_barra)
);

CREATE TABLE IF NOT EXISTS producto_precio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID NOT NULL REFERENCES producto(id) ON DELETE CASCADE,
  moneda TEXT NOT NULL DEFAULT 'ARS',
  precio NUMERIC(12,2) NOT NULL,
  vigente_desde TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stock por sucursal (simple)
CREATE TABLE IF NOT EXISTS stock_saldo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sucursal_id UUID NULL,
  producto_id UUID NOT NULL REFERENCES producto(id),
  cantidad NUMERIC(12,3) NOT NULL DEFAULT 0,
  UNIQUE (sucursal_id, producto_id)
);

-- Kardex / movimientos (auditoría)
CREATE TABLE IF NOT EXISTS stock_movimiento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sucursal_id UUID NULL,
  tipo TEXT NOT NULL, -- ENTRADA | SALIDA | AJUSTE | COMPRA | VENTA
  referencia_tipo TEXT NULL, -- venta, compra, ajuste
  referencia_id TEXT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_movimiento_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movimiento_id UUID NOT NULL REFERENCES stock_movimiento(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES producto(id),
  cantidad NUMERIC(12,3) NOT NULL
);
