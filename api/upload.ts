import { put } from '@vercel/blob'
import { isAuthed } from '../src/cms/server/session.js'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'])

const EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export default {
  async fetch(req: Request): Promise<Response> {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
    if (!(await isAuthed(req))) return json({ error: 'Unauthorized' }, 401)
    if (!process.env.BLOB_READ_WRITE_TOKEN) return new Response('Blob storage not configured', { status: 501 })

    let file: File | null = null
    try {
      const form = await req.formData()
      const entry = form.get('file')
      if (entry instanceof File) file = entry
    } catch {
      return json({ error: 'Bad request' }, 400)
    }

    if (!file) return json({ error: 'No file' }, 400)
    if (!ALLOWED.has(file.type)) return json({ error: 'Images only (png, jpg, webp, gif, svg)' }, 415)
    if (file.size > MAX_BYTES) return json({ error: 'Max 5 MB' }, 413)

    const ext = EXT[file.type] ?? 'png'
    const pathname = `cms/uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const blob = await put(pathname, file, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: false,
    })

    return json({ url: blob.url })
  },
}
