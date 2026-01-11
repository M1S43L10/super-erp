-- 005_usuarios.sql
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,          -- ej: admin, juan, etc
  nombre VARCHAR(100) NOT NULL,
  password_hash TEXT NOT NULL,            -- bcrypt
  rol TEXT NOT NULL DEFAULT 'ADMIN',      -- ADMIN | GERENTE | etc
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);
