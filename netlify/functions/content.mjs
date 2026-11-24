// GET /api/content/:area
// A védett terület szövegeit csak érvényes munkamenet-sütivel adja ki.
import { isArea, hasSession, json } from '../lib/security.mjs'
import { readArea } from '../lib/content.mjs'

export default async (req, context) => {
  if (req.method !== 'GET') return json(405, { error: 'method' }, { Allow: 'GET' })
  const area = context?.params?.area
  if (!isArea(area)) return json(404, { error: 'area' })
  if (!hasSession(req, area)) return json(401, { error: 'locked' })

  try {
    const data = await readArea(area)
    return json(200, data, { Vary: 'Cookie' })
  } catch (err) {
    console.error('content read failed', area, err?.message)
    return json(500, { error: 'content' })
  }
}

export const config = { path: '/api/content/:area' }
