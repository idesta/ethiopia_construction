-- ─────────────────────────────────────────
-- ETHIOPIA CONSTRUCTION PLATFORM
-- PostgreSQL Schema
-- Run once on fresh database
-- ─────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Admin users ───────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  email        TEXT        UNIQUE NOT NULL,
  password_hash TEXT       NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Tenants (one row = one construction company) ──
CREATE TABLE IF NOT EXISTS tenants (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT        UNIQUE NOT NULL,
  name          TEXT        NOT NULL,
  tagline       TEXT,
  logo_url      TEXT,
  primary_color TEXT        DEFAULT '#1a1a2e',
  accent_color  TEXT        DEFAULT '#f4a61d',
  founded_year  INT,
  is_active     BOOLEAN     DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Contacts (address, phone, email per company) ──
CREATE TABLE IF NOT EXISTS contacts (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id  UUID        REFERENCES tenants(id) ON DELETE CASCADE,
  email      TEXT,
  phone      TEXT,
  address    TEXT,
  city       TEXT,
  maps_url   TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Projects (portfolio) ──────────────────
CREATE TABLE IF NOT EXISTS projects (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    UUID        REFERENCES tenants(id) ON DELETE CASCADE,
  title        TEXT        NOT NULL,
  description  TEXT,
  location     TEXT,
  category     TEXT,
  status       TEXT        DEFAULT 'completed',
  completed_at DATE,
  cover_url    TEXT,
  sort_order   INT         DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Team members ──────────────────────────
CREATE TABLE IF NOT EXISTS team (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id  UUID        REFERENCES tenants(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  role       TEXT,
  photo_url  TEXT,
  sort_order INT         DEFAULT 0
);

-- ── Services ──────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID        REFERENCES tenants(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  description TEXT,
  icon        TEXT,
  sort_order  INT         DEFAULT 0
);

-- ── Media assets (metadata only, files on disk) ──
CREATE TABLE IF NOT EXISTS media_assets (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID        REFERENCES tenants(id) ON DELETE CASCADE,
  project_id  UUID        REFERENCES projects(id) ON DELETE SET NULL,
  file_path   TEXT        NOT NULL,  -- relative path under /mnt/data/uploads/
  public_url  TEXT        NOT NULL,  -- URL served by backend
  asset_type  TEXT        DEFAULT 'photo',  -- photo | logo | document
  file_name   TEXT,
  file_size   BIGINT,
  mime_type   TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Hero Scenes (per-tenant animated scene uploads) ──────────────
CREATE TABLE IF NOT EXISTS hero_scenes (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  url         TEXT        NOT NULL,   -- /uploads/{slug}/hero-scenes/{filename}
  file_path   TEXT        NOT NULL,   -- relative path on disk
  label       TEXT,                   -- optional display label
  sort_order  INT         DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tenants_slug       ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_contacts_tenant    ON contacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_projects_tenant    ON projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_team_tenant        ON team(tenant_id);
CREATE INDEX IF NOT EXISTS idx_services_tenant    ON services(tenant_id);
CREATE INDEX IF NOT EXISTS idx_media_tenant       ON media_assets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hero_scenes_tenant ON hero_scenes(tenant_id);

-- ── Seed: 2 test companies ────────────────
INSERT INTO tenants (slug, name, tagline, primary_color, accent_color, founded_year)
VALUES
  ('company-one', 'Abu Builders PLC',     'Building Ethiopia''s Future',          '#1a1a2e', '#f4a61d', 2010),
  ('company-two', 'Beta Construct S.C.',  'Quality Construction, Trusted Name',   '#0d3b2e', '#e8c14a', 2015)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO contacts (tenant_id, email, phone, address, city)
SELECT id, 'info@abubuilders.com', '+251 91 123 4567', 'Bole Sub-city, Woreda 03', 'Addis Ababa'
FROM tenants WHERE slug = 'company-one'
ON CONFLICT DO NOTHING;

INSERT INTO contacts (tenant_id, email, phone, address, city)
SELECT id, 'hello@betaconstruct.com', '+251 92 987 6543', 'Kirkos Sub-city, Woreda 08', 'Addis Ababa'
FROM tenants WHERE slug = 'company-two'
ON CONFLICT DO NOTHING;
