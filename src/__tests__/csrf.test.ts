import { describe, it, expect } from 'vitest'
import { isSameOrigin } from '../cms/server/csrf'

function reqWithHeaders(headers: Record<string, string>): Request {
  return new Request('https://beict-website.vercel.app/api/login', {
    method: 'POST',
    headers: { host: 'beict-website.vercel.app', ...headers },
  })
}

describe('isSameOrigin', () => {
  it('allows requests with a matching Origin', () => {
    expect(isSameOrigin(reqWithHeaders({ origin: 'https://beict-website.vercel.app' }))).toBe(true)
  })
  it('blocks cross-origin requests with a different Origin', () => {
    expect(isSameOrigin(reqWithHeaders({ origin: 'https://evil.example.com' }))).toBe(false)
  })
  it('blocks cross-origin requests with http vs https mismatch', () => {
    expect(isSameOrigin(reqWithHeaders({ origin: 'http://beict-website.vercel.app' }))).toBe(false)
  })
  it('falls back to Referer when Origin is absent', () => {
    expect(isSameOrigin(reqWithHeaders({ referer: 'https://beict-website.vercel.app/admin' }))).toBe(true)
    expect(isSameOrigin(reqWithHeaders({ referer: 'https://evil.example.com/' }))).toBe(false)
  })
  it('allows requests with no Origin and no Referer (same-origin browser POST, or non-browser)', () => {
    // Both missing — there's no way a cross-site form can omit both AND send a cookie.
    expect(isSameOrigin(reqWithHeaders({}))).toBe(true)
  })
  it('always allows GET/HEAD/OPTIONS', () => {
    const get = new Request('https://beict-website.vercel.app/x', { method: 'GET' })
    const head = new Request('https://beict-website.vercel.app/x', { method: 'HEAD' })
    const opts = new Request('https://beict-website.vercel.app/x', { method: 'OPTIONS' })
    expect(isSameOrigin(get)).toBe(true)
    expect(isSameOrigin(head)).toBe(true)
    expect(isSameOrigin(opts)).toBe(true)
  })
})
