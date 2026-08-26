/**
 * Vite plugin: implements the CMS API locally for `vite dev` and `vite preview`
 * so the admin flow (password from .env → cookie → edit → publish) works
 * without Vercel. Content persists to cms.local.json (git-ignored).
 *
 * NOTE: this is a development convenience. In production the real functions
 * in api/ run on Vercel instead.
 */
import fs from 'node:fs'
import path from 'node:path'
import { createHmac } from 'node:crypto'

const LOCAL_FILE = 'cms.local.json'
const COOKIE = 'cms_session'

function loadEnv(root) {
  const env = {}
  for (const name of ['.env', '.env.local']) {
    const p = path.join(root, name)
    if (!fs.existsSync(p)) continue
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
  return env
}

function sign(payload, secret) {
  return createHmac('sha256', secret).update(payload).digest('hex').slice(0, 32)
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = ''
    req.on('data', (c) => (data += c))
    req.on('end', () => resolve(data))
  })
}

function json(res, status, obj, headers = {}) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v)
  res.end(JSON.stringify(obj))
}

export function cmsLocalApi() {
  return {
    name: 'cms-local-api',
    configureServer(server) {
      server.middlewares.use(handler(server.config.root))
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler(server.config.root))
    },
  }
}

function handler(root) {
  const env = loadEnv(root)
  const secret = env.CMS_SESSION_SECRET || env.ADMIN_PASSWORD || 'local-dev'
  const cookieValue = `local.${sign('local', secret)}`

  return (req, res, next) => {
    const url = req.url.split('?')[0]

    if (url === '/api/login' && req.method === 'POST') {
      readBody(req).then((body) => {
        const expected = env.ADMIN_PASSWORD
        if (!expected) return json(res, 500, { error: 'ADMIN_PASSWORD is not set in .env' })
        let password = ''
        try {
          password = JSON.parse(body).password ?? ''
        } catch {}
        if (password !== expected) return json(res, 401, { error: 'Wrong password' })
        json(res, 200, { ok: true }, {
          'Set-Cookie': `${COOKIE}=${cookieValue}; HttpOnly; SameSite=Lax; Path=/`,
        })
      })
      return
    }

    if (url === '/api/logout' && req.method === 'POST') {
      return json(res, 200, { ok: true }, {
        'Set-Cookie': `${COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`,
      })
    }

    if (url === '/api/content') {
      const authed = (req.headers.cookie ?? '').includes(`${COOKIE}=${cookieValue}`)
      if (req.method === 'GET') {
        let content = null
        try {
          if (fs.existsSync(path.join(root, LOCAL_FILE))) content = JSON.parse(fs.readFileSync(path.join(root, LOCAL_FILE), 'utf8'))
        } catch {}
        return json(res, 200, { authed, content })
      }
      if (req.method === 'PUT') {
        if (!authed) return json(res, 401, { error: 'Unauthorized' })
        return readBody(req).then((body) => {
          try {
            const parsed = JSON.parse(body)
            fs.writeFileSync(path.join(root, LOCAL_FILE), JSON.stringify(parsed.content, null, 2))
            json(res, 200, { ok: true })
          } catch {
            json(res, 400, { error: 'Bad request' })
          }
        })
      }
    }

    // uploads intentionally unsupported locally — the client falls back to data URLs
    if (url === '/api/upload') {
      res.statusCode = 501
      return res.end()
    }

    next()
  }
}
