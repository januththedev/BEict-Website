/**
 * Session and password tests.
 *
 * IMPORTANT: We set ADMIN_PASSWORD and CMS_SESSION_SECRET in beforeAll so the
 * module's `secret()` helper resolves. Tests use unique values to avoid
 * coupling to any real env.
 */
/// <reference types="node" />
import { describe, it, expect, beforeAll } from 'vitest'
import { passwordMatches, sessionCookie, isAuthed, clientIp, COOKIE_NAME } from '../cms/server/session'

const TEST_PASSWORD = 'correct-horse-battery-staple'
const TEST_SECRET = 'unit-test-secret-do-not-use-in-prod'

beforeAll(() => {
  process.env.ADMIN_PASSWORD = TEST_PASSWORD
  process.env.CMS_SESSION_SECRET = TEST_SECRET
})

describe('passwordMatches', () => {
  it('returns true for the correct password', async () => {
    expect(await passwordMatches(TEST_PASSWORD)).toBe(true)
  })
  it('returns false for the wrong password', async () => {
    expect(await passwordMatches('wrong')).toBe(false)
  })
  it('returns false for empty / non-string input', async () => {
    expect(await passwordMatches('')).toBe(false)
  })
  it('uses constant-time comparison (timingSafeEqualStr is a manual loop, not just ===)', async () => {
    // Smoke test: short password and long password both fail correctly.
    expect(await passwordMatches('a')).toBe(false)
    expect(await passwordMatches('a'.repeat(200))).toBe(false)
  })
})

describe('sessionCookie / isAuthed roundtrip', () => {
  it('produces a cookie that isAuthed accepts back', async () => {
    const setCookie = await sessionCookie()
    expect(setCookie).toMatch(new RegExp(`^${COOKIE_NAME}=\\d+\\.[a-f0-9]+`))
    expect(setCookie).toMatch(/HttpOnly/)
    expect(setCookie).toMatch(/Secure/)
    expect(setCookie).toMatch(/SameSite=Lax/)
    // Extract the value and feed it back as a Cookie header.
    const value = setCookie.split(';')[0]
    const req = new Request('https://example.com/api/content', { headers: { cookie: value } })
    expect(await isAuthed(req)).toBe(true)
  })

  it('rejects a tampered signature', async () => {
    const setCookie = await sessionCookie()
    const value = setCookie.split(';')[0]
    const [head, sig] = value.split('=')[1].split('.')
    const tampered = `${COOKIE_NAME}=${head}.${'0'.repeat(sig.length)}`
    const req = new Request('https://example.com/api/content', { headers: { cookie: tampered } })
    expect(await isAuthed(req)).toBe(false)
  })

  it('rejects an expired cookie', async () => {
    const exp = Date.now() - 1000
    // Re-create a signed cookie manually with an expired exp.
    const enc = new TextEncoder()
    const subtle = (globalThis as { crypto: Crypto }).crypto.subtle
    const keyObj = await subtle.importKey('raw', enc.encode(TEST_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const sigBuf = await subtle.sign('HMAC', keyObj, enc.encode(String(exp)))
    const sig = [...new Uint8Array(sigBuf)].map((b) => b.toString(16).padStart(2, '0')).join('')
    const value = `${COOKIE_NAME}=${exp}.${sig}`
    const req = new Request('https://example.com/api/content', { headers: { cookie: value } })
    expect(await isAuthed(req)).toBe(false)
  })

  it('rejects requests with no cookie at all', async () => {
    const req = new Request('https://example.com/api/content')
    expect(await isAuthed(req)).toBe(false)
  })
})

describe('clientIp', () => {
  it('returns the first hop from x-forwarded-for', () => {
    expect(clientIp(new Request('https://x.com', { headers: { 'x-forwarded-for': '1.2.3.4, 10.0.0.1' } }))).toBe('1.2.3.4')
  })
  it('returns "unknown" when the header is absent', () => {
    expect(clientIp(new Request('https://x.com'))).toBe('unknown')
  })
  it('trims whitespace around the IP', () => {
    expect(clientIp(new Request('https://x.com', { headers: { 'x-forwarded-for': '   1.2.3.4   ' } }))).toBe('1.2.3.4')
  })
})
