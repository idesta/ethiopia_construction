-- ── Hero Slides migration ─────────────────────────────────────────
-- Run once on the live database:
--   docker exec -i construction_postgres psql -U postgres -d construction < /path/to/add_hero_slides.sql
--
-- Unlike hero_scenes (a flat gallery of decorative icons/images that
-- rotate inside ONE fixed hero), hero_slides are complete hero
-- compositions — each with its own headline, tagline, CTA, and visual
-- — that the hero itself rotates between. A tenant with zero rows here
-- keeps using the single static hero exactly as before.

CREATE TABLE IF NOT EXISTS hero_slides (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  headline        TEXT        NOT NULL,
  tagline         TEXT,
  cta_label       TEXT        DEFAULT 'View Our Work',
  cta_target      TEXT        DEFAULT 'projects',  -- section id passed to onScrollTo

  layout          TEXT        NOT NULL DEFAULT 'split',  -- 'split' | 'full-bleed'

  -- 'builtin_scene' = pick one of the 10 existing animated SVG construction
  -- icons (crane, bulldozer, excavator, etc.) by key, no upload required —
  -- guarantees every slide can carry a construction-themed visual even
  -- before a tenant uploads anything of their own.
  -- 'uploaded' = a tenant-provided image or video, same upload path as
  -- hero_scenes / project covers.
  media_type      TEXT        NOT NULL DEFAULT 'builtin_scene',  -- 'builtin_scene' | 'uploaded'
  media_ref       TEXT,       -- builtin_scene: registry key (e.g. 'crane'); uploaded: public URL
  poster_url      TEXT,       -- optional poster frame, only meaningful when media_ref is a video

  accent_override TEXT,       -- optional per-slide hex color; falls back to tenant.accent_color

  sort_order      INT         DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hero_slides_tenant ON hero_slides(tenant_id);
