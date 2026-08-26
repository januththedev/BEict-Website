import { passwordMatches, rateLimited, sessionCookie, clientIp } from '../src/cms/server/session'

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  if (!process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'ADMIN_PASSWORD is not configured' }, { status: 500 })
  }
  if (rateLimited(clientIp(req))) {
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
}
