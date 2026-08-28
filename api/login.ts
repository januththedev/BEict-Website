import { passwordMatches, sessionCookie, clientIp } from '../src/cms/server/session.js'
import { checkLoginThrottle } from '../src/cms/server/db.js'

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  })
}

export default {
  async fetch(req: Request): Promise<Response> {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

    try {
      if (!process.env.ADMIN_PASSWORD) {
        return json({ error: 'ADMIN_PASSWORD is not configured — add it in Vercel and redeploy' }, 500)
      }

      const ip = clientIp(req)
      let limited = false
      try {
        limited = await checkLoginThrottle(ip)
      } catch {
        limited = false
      }
      if (limited) {
        return json({ error: 'Too many attempts — wait 10 minutes' }, 429)
      }

      let password = ''
      try {
        const body = (await req.json()) as { password?: unknown }
        password = typeof body.password === 'string' ? body.password : ''
      } catch {
        return json({ error: 'Bad request' }, 400)
      }

      if (!(await passwordMatches(password))) {
        return json({ error: 'Wrong password' }, 401)
      }

      return json({ ok: true }, 200, { 'Set-Cookie': await sessionCookie() })
    } catch (err) {
      console.error('[cms] login crashed:', err)
      return json({ error: 'Login crashed — check the function logs in Vercel' }, 500)
    }
  },
}
