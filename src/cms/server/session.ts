/**
 * Session helpers for the CMS API (Vercel Node functions).
 * Zero dependencies: HMAC-SHA256 via the runtime's WebCrypto.
 *
 * The admin password lives only in the ADMIN_PASSWORD environment variable —
 * it is compared server-side and never leaves the server. The browser receives
 * an HttpOnly signed cookie it cannot read or forge.
 */

import { webcrypto } from 'node:crypto'

export const COOKIE_NAME = 'cms_session'
const SESSION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

// explicit webcrypto — do not depend on the global `crypto` being present
const subtle = webcrypto.subtle

function secret(): string {
  return process.env.CMS_SESSION_SECRET || process.env.ADMIN_PASSWORD || ''
}

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function hmac(payload: string, key: string): Promise<string> {
  const enc = new TextEncoder()
  const keyObj = await subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return toHex(await subtle.sign('HMAC', keyObj, enc.encode(payload)))
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** Constant-time password check (both sides hashed to equalise length). */
export async function passwordMatches(input: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected || typeof input !== 'string' || input.length === 0) return false
  const enc = new TextEncoder()
  const inHash = toHex(await subtle.digest('SHA-256', enc.encode(input)))
  const exHash = toHex(await subtle.digest('SHA-256', enc.encode(expected)))
  return timingSafeEqualStr(inHash, exHash)
}

/** Creates the Set-Cookie header value for a fresh 7-day session. */
export async function sessionCookie(): Promise<string> {
  const exp = Date.now() + SESSION_MS
  const sig = await hmac(String(exp), secret())
  return `${COOKIE_NAME}=${exp}.${sig}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_MS / 1000}`
}

export function clearedCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`
}

/** Returns true when the request carries a valid, unexpired session cookie. */
export async function isAuthed(req: Request): Promise<boolean> {
  try {
    const key = secret()
    if (!key) return false
    const cookieHeader = req.headers.get('cookie') ?? ''
    const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=(\\d+)\\.([a-f0-9]+)`))
    if (!match) return false
    const [, exp, sig] = match
    if (Number(exp) < Date.now()) return false
    const expectedSig = await hmac(exp, key)
    return timingSafeEqualStr(sig, expectedSig)
  } catch (err) {
    console.error('[cms] session check failed:', err)
    return false
  }
}

/** Best-effort client IP for rate limiting (throttle itself lives in db.ts / memory). */
export function clientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}
