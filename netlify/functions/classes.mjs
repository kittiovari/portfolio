// GET   /api/classes → [{ id, label }] (nyilvános: a belépőképernyő csoportválasztójához)
// POST  /api/classes { id, label, password } → új osztály (csak tanár)
// PATCH /api/classes { id, label?, password?, archived? } → módosítás (csak tanár)
// A diákjelszó scrypt-hashként kerül a (titkosított) nyilvántartásba.
import { hasSession, json, sameOrigin, hashPassword } from '../lib/security.mjs'
import { loadRegistry, saveRegistry, CLASS_ID } from '../lib/classroomStore.mjs'

const clean = (s, n) => String(s || '').trim().slice(0, n)

export default async (req) => {
  try {
    const list = await loadRegistry()
    if (req.method === 'GET') {
      const teacher = hasSession(req, 'teacher')
      return json(200, {
        classes: list.filter((c) => teacher || !c.archived).map((c) => ({ id: c.id, label: c.label, archived: Boolean(c.archived), ...(teacher ? { hasPassword: Boolean(c.pw) || ['9b', '9d'].includes(c.id) } : {}) })),
      }, { 'Cache-Control': 'no-store', Vary: 'Cookie' })
    }
    if (!hasSession(req, 'teacher')) return json(401, { error: 'locked' })
    if (!sameOrigin(req)) return json(403, { error: 'origin' })
    const body = await req.json().catch(() => ({}))
    const id = clean(body.id, 12).toLowerCase()
    if (!CLASS_ID.test(id)) return json(400, { error: 'id' })
    const label = clean(body.label, 24)
    const password = typeof body.password === 'string' ? body.password.trim().slice(0, 200) : ''

    if (req.method === 'POST') {
      if (list.some((c) => c.id === id)) return json(409, { error: 'exists' })
      if (!label) return json(400, { error: 'label' })
      if (password.length < 6) return json(400, { error: 'password' })
      const next = [...list, { id, label, pw: hashPassword(password), createdAt: Date.now() }]
      await saveRegistry(next)
      return json(200, { ok: true })
    }
    if (req.method === 'PATCH') {
      const c = list.find((x) => x.id === id)
      if (!c) return json(404, { error: 'class' })
      if (password && password.length < 6) return json(400, { error: 'password' })
      const next = list.map((x) => (x.id === id ? {
        ...x,
        ...(label ? { label } : {}),
        ...(password ? { pw: hashPassword(password) } : {}),
        ...(typeof body.archived === 'boolean' ? { archived: body.archived } : {}),
      } : x))
      await saveRegistry(next)
      return json(200, { ok: true })
    }
    return json(405, { error: 'method' }, { Allow: 'GET, POST, PATCH' })
  } catch (err) {
    console.error('classes failed', err?.message)
    return json(500, { error: 'store' })
  }
}

export const config = { path: '/api/classes' }
