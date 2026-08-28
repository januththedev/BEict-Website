// Manual smoke test for the new live-hero feature against the real Neon DB.
// - Loads the current saved content
// - Mocks a live broadcast by setting videos[0].liveBroadcastContent = 'live'
// - PUTs it back through the same SQL path /api/content uses
// - Then GETs it back and asserts the live flag survived
//
// Run with:  npx tsx scripts/test-live-hero.mjs

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { neon } from '@neondatabase/serverless'

// Read DATABASE_URL from the project .env without a dotenv dependency
const here = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(here, '..', '.env')
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    }),
)

const DATABASE_URL = env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set in .env — aborting')
  process.exit(1)
}

// Mirror the channel_binding strip from src/cms/server/db.ts
function connectionString(raw) {
  try {
    const u = new URL(raw)
    u.searchParams.delete('channel_binding')
    return u.toString()
  } catch {
    return raw
  }
}
const cs = connectionString(DATABASE_URL)
const sql = neon(cs)

async function loadRow() {
  const rows = await sql`SELECT data FROM cms_content WHERE id = 1 LIMIT 1`
  return rows[0]?.data ?? null
}
async function saveRow(data) {
  const json = JSON.stringify(data)
  await sql`INSERT INTO cms_content (id, data, updated_at) VALUES (1, ${json}::jsonb, now())
            ON CONFLICT (id) DO UPDATE SET data = ${json}::jsonb, updated_at = now()`
}

const before = await loadRow()
if (!before) {
  console.error('No saved content to mutate — publish once from /admin first')
  process.exit(1)
}

const v0 = before.community?.videos?.[0]
if (!v0) {
  console.error('Saved content has no videos — cannot test')
  process.exit(1)
}
console.log('Current top video:', v0.title, '|', v0.liveBroadcastContent ?? '(no field)')

// Mutate: pretend the top video is live
const mutated = JSON.parse(JSON.stringify(before))
mutated.community.videos[0].liveBroadcastContent = 'live'
mutated.community.videos[0].concurrentViewers = 42
// Site flags for the cron
mutated.site.ytAutoSync = true
mutated.site.ytLastSyncAt = new Date().toISOString()
await saveRow(mutated)
console.log('Wrote live flag for top video (concurrentViewers=42)')

const after = await loadRow()
const top = after.community.videos[0]
console.log('After round-trip:')
console.log('  title:', top.title)
console.log('  liveBroadcastContent:', top.liveBroadcastContent)
console.log('  concurrentViewers:', top.concurrentViewers)
console.log('  site.ytAutoSync:', after.site.ytAutoSync)
console.log('  site.ytLastSyncAt:', after.site.ytLastSyncAt)

if (top.liveBroadcastContent !== 'live') {
  console.error('FAIL: live flag did not survive')
  process.exit(1)
}
if (top.concurrentViewers !== 42) {
  console.error('FAIL: viewer count did not survive')
  process.exit(1)
}
if (after.site.ytAutoSync !== true) {
  console.error('FAIL: ytAutoSync did not survive')
  process.exit(1)
}

console.log('\nOK — schema accepts the new fields, round-trip works.')

// Restore the original state so the live site isn't left with a fake live flag.
await saveRow(before)
console.log('Restored original content.')
