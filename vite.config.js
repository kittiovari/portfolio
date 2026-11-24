import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { loadEnv as loadDotEnv } from './scripts/env.mjs'

// Helyi fejlesztéshez: az /api/* kéréseket ugyanazok a Netlify-függvények
// szolgálják ki, mint élesben – így `npm run dev` alatt is valódi a zár.
// A titkok (.env) csak a szerveroldali process.env-be kerülnek; a böngészőbe
// a Vite kizárólag a VITE_ kezdetű változókat engedi át.
const API_ROUTES = [
  { re: /^\/api\/unlock$/, fn: 'unlock', keys: [] },
  { re: /^\/api\/session$/, fn: 'session', keys: [] },
  { re: /^\/api\/content\/([^/]+)$/, fn: 'content', keys: ['area'] },
  { re: /^\/api\/asset\/([^/]+)\/([^/]+)$/, fn: 'asset', keys: ['area', 'name'] },
]

function netlifyFunctionsDev() {
  return {
    name: 'netlify-functions-dev',
    configureServer(server) {
      // Saját .env-olvasó: a scrypt-hash $ jeleit nem értelmezi változóként
      loadDotEnv()

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host}`)
        const route = API_ROUTES.find((r) => r.re.test(url.pathname))
        if (!route) return url.pathname.startsWith('/api/') ? sendStatus(res, 404) : next()

        try {
          const match = url.pathname.match(route.re)
          const params = Object.fromEntries(route.keys.map((k, i) => [k, decodeURIComponent(match[i + 1])]))
          const chunks = []
          for await (const c of req) chunks.push(c)
          const request = new Request(url, {
            method: req.method,
            headers: req.headers,
            body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks),
          })
          const mod = await server.ssrLoadModule(`/netlify/functions/${route.fn}.mjs`)
          const response = await mod.default(request, { params, ip: req.socket.remoteAddress })

          res.statusCode = response.status
          response.headers.forEach((value, key) => { if (key !== 'set-cookie') res.setHeader(key, value) })
          const cookies = response.headers.getSetCookie?.() ?? []
          if (cookies.length) res.setHeader('Set-Cookie', cookies)
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (err) {
          console.error('[api]', err)
          sendStatus(res, 500)
        }
      })
    },
  }
}

function sendStatus(res, code) {
  res.statusCode = code
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ error: code }))
}

export default defineConfig({
  plugins: [react(), netlifyFunctionsDev()],
})
