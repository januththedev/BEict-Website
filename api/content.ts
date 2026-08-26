import { put } from '@vercel/blob'
import { isAuthed } from '../src/cms/server/session.js'
import { loadContent, saveContent, getSql } from '../src/cms/server/db.js'
import { validateContent } from '../src/cms/schema.js'

const CONTENT_PATH = 'cms/content.json'

/** Storage precedence: Neon (DATABASE_URL) → Vercel Blob → nothing. */
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

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'GET') {
    const authed = await isAuthed(req)
    let content: unknown = null
    try {
      content = await readStoredContent()
    } catch (err) {
      console.error('[cms] content GET read failed:', err)
      content = null
    }
    return new Response(JSON.stringify({ authed, content }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // short edge cache: edits appear within seconds, visits stay cheap
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60',
      },
    })
  }

  if (req.method === 'PUT') {
    try {
      if (!(await isAuthed(req))) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      let payload: { content?: unknown }
      try {
        payload = (await req.json()) as { content?: unknown }
      } catch {
        return Response.json({ error: 'Bad request' }, { status: 400 })
      }

      // Schema validation: unknown fields are dropped, structure is fixed.
      const valid = validateContent(payload?.content)
      if (!valid) return Response.json({ error: 'Invalid content' }, { status: 400 })

      // Prefer Neon; on any Neon failure fall back to Blob; 500 JSON if both fail.
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
          return Response.json({ error: 'No storage configured (DATABASE_URL / Blob token)' }, { status: 500 })
        }
        await put(CONTENT_PATH, JSON.stringify(valid), {
          access: 'public',
          allowOverwrite: true,
          contentType: 'application/json',
        })
        savedVia = 'blob'
      }

      return Response.json({ ok: true, savedVia })
    } catch (err) {
      console.error('[cms] content PUT crashed:', err)
      return Response.json({ error: 'Save crashed — check the function logs in Vercel' }, { status: 500 })
    }
  }

  return new Response('Method not allowed', { status: 405 })
}
