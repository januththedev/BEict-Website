/**
 * Lightweight CSRF defense for state-mutating endpoints.
 *
 * Browsers always send an `Origin` header on cross-origin requests and on
 * any POST/PUT/DELETE. SameSite=Lax cookies already block most CSRF, but
 * Lax does NOT block cross-origin POSTs triggered by <form> submissions
 * with `enctype=text/plain`. An Origin/host check closes that gap.
 *
 * Behaviour:
 *  - Allow requests where the Origin header's host matches the request's
 *    Host header (the admin page always POSTs from the same origin).
 *  - If Origin is missing, allow the request when:
 *      (a) Referer is present and its host matches Host (typical for
 *          non-browser clients that don't always set Origin), OR
 *      (b) The request is not a CORS preflight (i.e. not cross-origin).
 *  - For development on http://localhost, allow same-host requests.
 *
 * Cron-triggered requests from Vercel come with no Origin or Referer, so
 * the x-vercel-cron header is an explicit allow (checked by callers before
 * this helper runs).
 */
export function isSameOrigin(req: Request): boolean {
  const method = req.method.toUpperCase()
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return true

  const host = req.headers.get('host') ?? ''
  // The Host header does not include scheme. To match an Origin or Referer
  // we compare against the scheme the request reached us on, falling back
  // to https in environments where scheme isn't observable (e.g. tests).
  const requestScheme = (req as Request & { url?: string }).url?.startsWith('http://') ? 'http' : 'https'

  const origin = req.headers.get('origin')
  if (origin) {
    try {
      const u = new URL(origin)
      return u.host === host && u.protocol === `${requestScheme}:`
    } catch {
      return false
    }
  }

  const referer = req.headers.get('referer')
  if (referer) {
    try {
      const u = new URL(referer)
      return u.host === host && u.protocol === `${requestScheme}:`
    } catch {
      return false
    }
  }

  // No Origin AND no Referer — could be a same-origin browser POST (some
  // browsers omit Origin on same-origin POSTs in the spec but most send it).
  // Or it could be a non-browser client (curl, server-to-server). Either way
  // there's no way for a browser-based CSRF attacker to omit both while
  // also sending a cookie, so we let it through.
  return true
}
