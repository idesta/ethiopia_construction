-- ── Hero Scenes migration ─────────────────────────────────────────
-- Run once on the live database:
--   docker exec -i construction_postgres psql -U postgres -d construction < /path/to/add_hero_scenes.sql

CREATE TABLE IF NOT EXISTS hero_scenes (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  url         TEXT        NOT NULL,   -- /uploads/{slug}/hero-scenes/{filename}
  file_path   TEXT        NOT NULL,   -- relative path on disk
  label       TEXT,                   -- optional display label
  sort_order  INT         DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hero_scenes_tenant ON hero_scenes(tenant_id);
