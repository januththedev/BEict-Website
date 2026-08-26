import { passwordMatches, sessionCookie, clientIp } from '../src/cms/server/session'
import { checkLoginThrottle } from '../src/cms/server/db'

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  try {
    if (!process.env.ADMIN_PASSWORD) {
      return Response.json({ error: 'ADMIN_PASSWORD is not configured — add it in Vercel and redeploy' }, { status: 500 })
    }

    const ip = clientIp(req)
    // Persistent throttle when Neon is configured; in-memory fallback otherwise.
    let limited = false
    try {
      limited = await checkLoginThrottle(ip)
    } catch {
      limited = false // never let throttle infrastructure block login
    }
    if (limited) {
      return Response.json({ error: 'Too many attempts — wait 10 minutes' }, { status: 429 })
    }

    let password = ''
    try {
      const body = (await req.json()) as { password?: unknown }
      password = typeof body.password === 'string' ? body.password : ''
    } catch {
      return Response.json({ error: 'Bad request' }, { status: 400 })
    }

    if (!(await passwordMatches(password))) {
      return Response.json({ error: 'Wrong password' }, { status: 401 })
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Set-Cookie': await sessionCookie() },
    })
  } catch (err) {
    console.error('[cms] login crashed:', err)
    return Response.json({ error: 'Login crashed — check the function logs in Vercel' }, { status: 500 })
  }
}
