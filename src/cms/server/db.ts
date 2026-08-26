/**
 * Neon Postgres access for the CMS (Vercel Node functions).
 *
 * The database is optional at runtime: when DATABASE_URL is set, Neon is the
 * source of truth for CMS content and login throttling; otherwise the API
 * falls back to Vercel Blob (content) / in-memory (throttle) so local dev and
 * blob-only deployments keep working.
 *
 * Tables self-migrate on first use (idempotent CREATE TABLE IF NOT EXISTS).
 */

import { neon } from '@neondatabase/serverless'

// Node runtime global (this module is imported only by Vercel API functions)
declare const process: { env: Record<string, string | undefined> }

type Sql = ReturnType<typeof neon>

let cached: Sql | null | undefined
let schemaReady = false

export function getSql(): Sql | null {
  if (cached !== undefined) return cached
  const url = process.env.DATABASE_URL
  cached = url ? neon(url) : null
  return cached
}

export async function ensureSchema(): Promise<void> {
  const sql = getSql()
  if (!sql || schemaReady) return
  await sql`CREATE TABLE IF NOT EXISTS cms_content (
    id integer PRIMARY KEY DEFAULT 1,
    data jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`
  await sql`CREATE TABLE IF NOT EXISTS cms_login_throttle (
    ip text PRIMARY KEY,
    count integer NOT NULL DEFAULT 0,
    window_start timestamptz NOT NULL DEFAULT now()
  )`
  schemaReady = true
}

/** Saved CMS content (validated JSON), or null when absent. */
export async function loadContent(): Promise<unknown | null> {
  const sql = getSql()
  if (!sql) return null
  await ensureSchema()
  const rows = (await sql`SELECT data FROM cms_content WHERE id = 1 LIMIT 1`) as { data: unknown }[]
  return rows.length ? rows[0].data : null
}

export async function saveContent(data: unknown): Promise<void> {
  const sql = getSql()
  if (!sql) return
  await ensureSchema()
  const json = JSON.stringify(data)
  await sql`INSERT INTO cms_content (id, data, updated_at) VALUES (1, ${json}::jsonb, now())
            ON CONFLICT (id) DO UPDATE SET data = ${json}::jsonb, updated_at = now()`
}

/**
 * Persistent login throttle: max 10 attempts per IP per 10-minute window.
 * Returns true when the IP is over the limit.
 */
export async function checkLoginThrottle(ip: string): Promise<boolean> {
  const sql = getSql()
  if (!sql) return false
  await ensureSchema()
  const rows = (await sql`SELECT count, window_start FROM cms_login_throttle WHERE ip = ${ip} LIMIT 1`) as {
    count: number
    window_start: string
  }[]
  if (rows.length === 0) {
    await sql`INSERT INTO cms_login_throttle (ip, count, window_start) VALUES (${ip}, 1, now())`
    return false
  }
  const row = rows[0] as { count: number; window_start: string }
  const windowExpired = Date.now() - new Date(row.window_start).getTime() > 10 * 60 * 1000
  if (windowExpired) {
    await sql`UPDATE cms_login_throttle SET count = 1, window_start = now() WHERE ip = ${ip}`
    return false
  }
  const count = row.count + 1
  await sql`UPDATE cms_login_throttle SET count = ${count} WHERE ip = ${ip}`
  return count > 10
}
