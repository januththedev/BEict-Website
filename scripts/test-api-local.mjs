// Local harness: runs the BUNDLED handlers (esbuild output in .tmp/) so
// production crashes reproduce here. Bundle first:
//   npx esbuild api/login.ts --bundle --platform=node --format=esm --outfile=.tmp/login.mjs
//   npx esbuild api/content.ts --bundle --platform=node --format=esm --outfile=.tmp/content.mjs
// Usage: ADMIN_PASSWORD=... DATABASE_URL=... node scripts/test-api-local.mjs
import { createServer } from 'node:http'

const handlers = {
  '/api/login': (await import('../.tmp/login.mjs')).default,
  '/api/content': (await import('../.tmp/content.mjs')).default,
}

const server = createServer(async (req, res) => {
  const url = req.url.split('?')[0]
  const handler = handlers[url]
  if (!handler) {
    res.statusCode = 404
    return res.end('no route')
  }
  const chunks = []
  for await (const c of req) chunks.push(c)
  const body = chunks.length ? Buffer.concat(chunks).toString() : undefined
  const request = new Request(`http://localhost:4199${req.url}`, {
    method: req.method,
    headers: { 'content-type': 'application/json', cookie: req.headers.cookie ?? '' },
    body: ['POST', 'PUT'].includes(req.method) ? body : undefined,
  })
  try {
    const response = await handler(request)
    res.statusCode = response.status
    response.headers.forEach((v, k) => res.setHeader(k, v))
    res.end(await response.text())
  } catch (err) {
    console.error('HANDLER THREW:', err)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'HANDLER_THREW', message: String(err) }))
  }
})

server.listen(4199, () => console.log('test server on 4199'))
