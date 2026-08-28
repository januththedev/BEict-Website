import { put } from '@vercel/blob'
import { isAuthed } from '../src/cms/server/session.js'
import { loadContent, saveContent, getSql } from '../src/cms/server/db.js'
import { validateContent } from '../src/cms/schema.js'

const CONTENT_PATH = 'cms/content.json'

async function readStoredContent(): Promise<unknown> {
  if (getSql()) {
    return loadContent()
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null
  const { list } = await import('@vercel/blob')
  const { blobs } = await list({ prefix: CONTENT_PATH, limit: 1 })
  if (blobs.length === 0) return null
  const res = await fetch(blobs[0].url, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  })
}

export default {
  async fetch(req: Request): Promise<Response> {
    if (req.method === 'GET') {
      let authed = false
      let content: unknown = null
      try {
        authed = await isAuthed(req)
        content = await readStoredContent()
      } catch (err) {
        console.error('[cms] content GET read failed:', err)
        content = null
      }
      // Authed reads must never be shared-cached (cookie-bound); unauthed reads
      // get a short public cache so the public site stays cheap.
      const cacheHeaders = authed
        ? { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }
        : { 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60', Vary: 'Cookie' }
      return json({ authed, content }, 200, cacheHeaders)
    }

    if (req.method === 'PUT') {
      try {
        if (!(await isAuthed(req))) {
          return json({ error: 'Unauthorized' }, 401)
        }

        let payload: { content?: unknown }
        try {
          payload = (await req.json()) as { content?: unknown }
        } catch {
          return json({ error: 'Bad request' }, 400)
        }

        const valid = validateContent(payload?.content)
        if (!valid) return json({ error: 'Invalid content' }, 400)

        let savedVia: string | null = null
        try {
          if (getSql()) {
            await saveContent(valid)
            savedVia = 'neon'
          }
        } catch (err) {
          console.error('[cms] Neon save failed, falling back to Blob:', err)
        }

        if (!savedVia) {
          if (!process.env.BLOB_READ_WRITE_TOKEN) {
            return json({ error: 'No storage configured (DATABASE_URL / Blob token)' }, 500)
          }
          await put(CONTENT_PATH, JSON.stringify(valid), {
            access: 'public',
            allowOverwrite: true,
            contentType: 'application/json',
          })
          savedVia = 'blob'
        }

        return json({ ok: true, savedVia })
      } catch (err) {
        console.error('[cms] content PUT crashed:', err)
        return json({ error: 'Save crashed — check the function logs in Vercel' }, 500)
      }
    }

    return new Response('Method not allowed', { status: 405 })
  },
}
