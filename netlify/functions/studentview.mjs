// POST /api/studentview/:cls  { code } – egy diák SAJÁT, teljes riportja.
// Feltétel: az osztály jelszavával (language-<cls>) vagy tanárként belépve,
// ÉS a tanártól kapott személyes kód. Csak annak az egy diáknak az adatai
// kerülnek ki (a negatív bejegyzésekkel, E-Kréta-számlálókkal együtt).
// Rossz kódra ugyanaz a próbálkozáskorlát érvényes, mint a jelszavaknál.
import { json, sameOrigin } from '../lib/security.mjs'
import { isClass, loadArchive, loadAvatars, saveAvatars, cleanAvatar, loadWork } from '../lib/classroomStore.mjs'
import { authStudent, workEvents, publicSub } from '../lib/studentWork.mjs'
import { levelIndex, positiveTotal, avatarAllowed } from '../../src/classroom/levels.js'
import { balanceOf } from '../lib/privileges.mjs'

export default async (req, context) => {
  if (req.method !== 'POST') return json(405, { error: 'method' }, { Allow: 'POST' })
  if (!sameOrigin(req)) return json(403, { error: 'origin' })
  const cls = context?.params?.cls
  if (!(await isClass(cls))) return json(404, { error: 'class' })

  let body
  try { body = await req.json() } catch { return json(400, { error: 'body' }) }

  try {
    const auth = await authStudent(req, context, cls, body)
    if (auth.res) return auth.res
    const { doc, s } = auth
    const avatars = await loadAvatars(cls)
    const past = []
    for (const y of doc.previousYears || []) {
      const a = await loadArchive(cls, y).catch(() => null)
      if (a) past.push(...(a.events || []).filter((e) => e.s === s.id))
    }
    const work = await loadWork(cls, s.id)
    const all = [...past, ...(doc.events || []).filter((e) => e.src !== 'x'), ...workEvents(doc, s.id, work)].filter((e) => e.s === s.id)
    // a saját avatar módosítása (csak érvényes értékekkel; a szinthez kötött elemek csak
    // a szint elérése után – kivéve, ha a tanár már beállította neki)
    if (body?.avatar !== undefined) {
      const a = cleanAvatar(body.avatar)
      if (!a) return json(400, { error: 'avatar' })
      const current = avatars[s.id]?.a || s.avatar || {}
      if (!avatarAllowed(a, levelIndex(positiveTotal(all)), current)) return json(403, { error: 'level' })
      avatars[s.id] = { a, prev: avatars[s.id]?.a || s.avatar || null, at: Date.now() }
      await saveAvatars(cls, avatars)
      return json(200, { ok: true, avatar: a }, { 'Cache-Control': 'no-store' })
    }
    const events = all
      .map((e) => ({ id: e.id, s: e.s, k: e.k, n: e.n, i: e.i, v: e.v, t: e.t, l: e.l, sn: e.sn, auto: e.auto, redeem: e.redeem, src: e.src }))
    const attendance = Object.entries(doc.attendance || {})
      .filter(([, m]) => m?.[s.id]).map(([date, m]) => ({ date, status: m[s.id] }))
    const subs = Object.fromEntries(Object.entries(work.subs).map(([k, v]) => [k, publicSub(v)]))
    return json(200, { id: s.id, avatar: avatars[s.id]?.a || s.avatar, events, resets: doc.resets?.[s.id] || {}, attendance, subs, reqs: work.reqs, balance: balanceOf(doc, s.id, work) }, { 'Cache-Control': 'no-store' })
  } catch (err) {
    console.error('studentview failed', cls, err?.message)
    return json(500, { error: 'store' })
  }
}

export const config = { path: '/api/studentview/:cls' }
