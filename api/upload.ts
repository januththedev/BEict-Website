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

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  if (!(await isAuthed(req))) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!process.env.BLOB_READ_WRITE_TOKEN) return new Response('Blob storage not configured', { status: 501 })

  let file: File | null = null
  try {
    const form = await req.formData()
    const entry = form.get('file')
    if (entry instanceof File) file = entry
  } catch {
    return Response.json({ error: 'Bad request' }, { status: 400 })
  }

  if (!file) return Response.json({ error: 'No file' }, { status: 400 })
  if (!ALLOWED.has(file.type)) return Response.json({ error: 'Images only (png, jpg, webp, gif, svg)' }, { status: 415 })
  if (file.size > MAX_BYTES) return Response.json({ error: 'Max 5 MB' }, { status: 413 })

  const ext = EXT[file.type] ?? 'png'
  const pathname = `cms/uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const blob = await put(pathname, file, {
    access: 'public',
    contentType: file.type,
    addRandomSuffix: false,
  })

  return Response.json({ url: blob.url })
}
