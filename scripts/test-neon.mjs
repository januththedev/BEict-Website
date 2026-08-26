/**
 * One-off connectivity test against the real Neon database.
 * Verifies: connection, schema migration (cms.sql equivalent), and a
 * content round-trip using the exact SQL the CMS API uses.
 *
 * Run: node scripts/test-neon.mjs
 */
import { neon } from '@neondatabase/serverless'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL missing — load it from .env')
  process.exit(1)
}

const sql = neon(url)

// 1. migrate (same statements as src/cms/server/db.ts ensureSchema)
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
console.log('✓ schema ready (cms_content, cms_login_throttle)')

// 2. content round-trip on a throwaway row (id=999), then clean up
const test = { version: 2, note: 'connectivity-test', at: new Date().toISOString() }
await sql`INSERT INTO cms_content (id, data, updated_at) VALUES (999, ${JSON.stringify(test)}::jsonb, now())
          ON CONFLICT (id) DO UPDATE SET data = ${JSON.stringify(test)}::jsonb, updated_at = now()`
const rows = await sql`SELECT data FROM cms_content WHERE id = 999 LIMIT 1`
const roundTrip = rows[0]?.data?.note === 'connectivity-test'
await sql`DELETE FROM cms_content WHERE id = 999`
console.log(roundTrip ? '✓ content round-trip OK (jsonb write + read + delete)' : '✗ round-trip FAILED')

// 3. throttle table round-trip
await sql`INSERT INTO cms_login_throttle (ip, count, window_start) VALUES ('test-ip', 1, now())
          ON CONFLICT (ip) DO UPDATE SET count = 1, window_start = now()`
const throttle = await sql`SELECT count FROM cms_login_throttle WHERE ip = 'test-ip' LIMIT 1`
await sql`DELETE FROM cms_login_throttle WHERE ip = 'test-ip'`
console.log(throttle[0]?.count === 1 ? '✓ login throttle table OK' : '✗ throttle FAILED')

// 4. state check
const final = await sql`SELECT id FROM cms_content`
console.log(`✓ cms_content rows now: ${final.map((r) => r.id).join(', ') || 'none'} (CMS will use id=1 on first publish)`)
