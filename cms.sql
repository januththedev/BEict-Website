-- BEICT CMS — Neon Postgres schema
-- Reference only: the API auto-creates these tables on first use.
-- Run manually with: psql "$DATABASE_URL" -f cms.sql

CREATE TABLE IF NOT EXISTS cms_content (
  id integer PRIMARY KEY DEFAULT 1,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cms_login_throttle (
  ip text PRIMARY KEY,
  count integer NOT NULL DEFAULT 0,
  window_start timestamptz NOT NULL DEFAULT now()
);
