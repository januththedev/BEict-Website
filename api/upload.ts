/**
 * Image upload endpoint. Writes the file to Vercel Blob and returns the
 * public URL.
 *
 * Security notes:
 *  - SVG is intentionally NOT allowed. SVG is XML and can embed <script>,
 *    javascript: URIs, and onerror/onload handlers. Sanitising SVG is
 *    error-prone; refusing the type entirely is the safe choice. Favicons
 *    should be .png/.ico; OG images should be .png/.jpg/.webp.
 *  - The declared Content-Type is only a hint. We also sniff the first
 *    16 bytes of the file and reject anything whose magic bytes don't
 *    match the allowed image types.
 *  - Pathname uses crypto.randomUUID() so the resulting URL is
 *    unguessable (replaces the previous Math.random()-based name).
 *  - Per-IP rate limit: 20 uploads / 10 min. Defense in depth even
 *    though the route requires an admin session.
 */
import { put } from '@vercel/blob'
import { randomUUID } from 'node:crypto'
import { isAuthed, clientIp } from '../src/cms/server/session.js'
import { isSameOrigin } from '../src/cms/server/csrf.js'

const MAX_BYTES = 5 * 1024 * 1024
const MAX_PER_WINDOW = 20
const WINDOW_MS = 10 * 60 * 1000

// Allowed (declared type → file extension → magic-byte header)
const ALLOWED: { mime: string; ext: string; magic: number[] }[] = [
  { mime: 'image/png', ext: 'png', magic: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mime: 'image/jpeg', ext: 'jpg', magic: [0xff, 0xd8, 0xff] },
  { mime: 'image/webp', ext: 'webp', magic: [0x52, 0x49, 0x46, 0x46] }, // "RIFF" — full check below
  { mime: 'image/gif', ext: 'gif', magic: [0x47, 0x49, 0x46, 0x38] }, // "GIF8"
]

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/** In-memory per-IP upload counter. Fails open if a process restart wipes it. */
const uploadCounts = new Map<string, { count: number; windowStart: number }>()
function checkUploadRate(ip: string): boolean {
  const now = Date.now()
  const entry = uploadCounts.get(ip)
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    uploadCounts.set(ip, { count: 1, windowStart: now })
    return false
  }
  entry.count += 1
  return entry.count > MAX_PER_WINDOW
}

function matchesMagic(buf: Uint8Array, expected: number[]): boolean {
  if (buf.length < expected.length) return false
  for (let i = 0; i < expected.length; i++) if (buf[i] !== expected[i]) return false
  return true
}

/**
 * Validates a file's declared type AND its actual byte signature.
 * For WebP we also check the "WEBP" marker at offset 8 (RIFF....WEBP).
 */
async function validateImage(file: File): Promise<{ ok: true; ext: string } | { ok: false; reason: string }> {
  if (file.size > MAX_BYTES) return { ok: false, reason: 'Max 5 MB' }
  const match = ALLOWED.find((a) => a.mime === file.type)
  if (!match) return { ok: false, reason: 'Images only (png, jpg, webp, gif)' }
  // Read the first 12 bytes for the magic-byte sniff.
  const buf = await file.slice(0, 12).arrayBuffer()
  const header = new Uint8Array(buf)
  if (!matchesMagic(header, match.magic)) {
    return { ok: false, reason: `File contents don't match declared ${match.mime}` }
  }
  if (match.ext === 'webp' && header.length >= 12) {
    // RIFF....WEBP
    const tail = String.fromCharCode(header[8], header[9], header[10], header[11])
    if (tail !== 'WEBP') return { ok: false, reason: 'Not a valid WebP file' }
  }
  return { ok: true, ext: match.ext }
}

export default {
  async fetch(req: Request): Promise<Response> {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
    if (!(await isAuthed(req))) return json({ error: 'Unauthorized' }, 401)
    if (!isSameOrigin(req)) return json({ error: 'Cross-origin request blocked' }, 403)
    if (!process.env.BLOB_READ_WRITE_TOKEN) return new Response('Blob storage not configured', { status: 501 })

    const ip = clientIp(req)
    if (checkUploadRate(ip)) {
      return json({ error: 'Too many uploads — wait 10 minutes' }, 429)
    }

    let file: File | null = null
    try {
      const form = await req.formData()
      const entry = form.get('file')
      if (entry instanceof File) file = entry
    } catch {
      return json({ error: 'Bad request' }, 400)
    }

    if (!file) return json({ error: 'No file' }, 400)

    const verdict = await validateImage(file)
    if (!verdict.ok) return json({ error: verdict.reason }, 415)

    const pathname = `cms/uploads/${Date.now()}-${randomUUID()}.${verdict.ext}`

    const blob = await put(pathname, file, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: false,
    })

    return json({ url: blob.url })
  },
}
