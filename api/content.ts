import { put } from '@vercel/blob'
import { isAuthed } from '../src/cms/server/session'
import { validateContent } from '../src/cms/schema'

const CONTENT_PATH = 'cms/content.json'

async function readStoredContent(): Promise<unknown> {
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
    } catch {
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
    if (!(await isAuthed(req))) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return new Response('Blob storage not configured', { status: 501 })
    }

    let payload: unknown
    try {
      payload = (await req.json()) as { content?: unknown }
    } catch {
      return Response.json({ error: 'Bad request' }, { status: 400 })
    }

    // Schema validation: unknown fields are dropped, structure is fixed.
    const valid = validateContent((payload as { content?: unknown })?.content)
    if (!valid) return Response.json({ error: 'Invalid content' }, { status: 400 })

    await put(CONTENT_PATH, JSON.stringify(valid), {
      access: 'public',
      allowOverwrite: true,
      contentType: 'application/json',
    })

    return Response.json({ ok: true })
  }

  return new Response('Method not allowed', { status: 405 })
}
