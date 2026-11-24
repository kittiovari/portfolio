// GET /api/asset/:area/:name
// Védett képek (pl. ügyfélprojektek képernyőképei) csak érvényes sütivel.
import { isArea, hasSession, json } from '../lib/security.mjs'
import { readAsset, contentType } from '../lib/content.mjs'

export default async (req, context) => {
  if (req.method !== 'GET') return json(405, { error: 'method' }, { Allow: 'GET' })
  const area = context?.params?.area
  const name = context?.params?.name || ''
  if (!isArea(area)) return json(404, { error: 'area' })
  if (!hasSession(req, area)) return json(401, { error: 'locked' })

  const data = await readAsset(area, name)
  if (!data) return json(404, { error: 'asset' })

  return new Response(data, {
    status: 200,
    headers: {
      'Content-Type': contentType(name),
      // Csak a látogató saját böngészője tárolhatja, megosztott cache nem
      'Cache-Control': 'private, max-age=3600',
      Vary: 'Cookie',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}

export const config = { path: '/api/asset/:area/:name' }
