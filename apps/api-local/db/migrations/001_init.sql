-- 001_init.sql
-- Base mínima offline-first: schema_migrations + outbox_event

CREATE TABLE IF NOT EXISTS schema_migrations (
  id TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS outbox_event (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NULL,

  event_type TEXT NOT NULL,        -- SALE_CREATED, STOCK_MOVED, etc.
  aggregate_type TEXT NOT NULL,    -- sale, product, stock_movement, etc.
  aggregate_id TEXT NOT NULL,      -- id del agregado (string para flexibilidad)
  payload JSONB NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ NULL,
  attempts INT NOT NULL DEFAULT 0,
  last_error TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_outbox_event_sent_at ON outbox_event(sent_at);
CREATE INDEX IF NOT EXISTS idx_outbox_event_created_at ON outbox_event(created_at);
CREATE INDEX IF NOT EXISTS idx_outbox_event_type ON outbox_event(event_type);
