// A diákok saját munkáinak közös logikája (szorgalmi beadás, kiváltság-kérés):
// személyes kódos azonosítás, feladat-kulcs, automatikus javítás és a belőlük
// képzett pont-események. A pont-események NEM kerülnek az osztály dokumentumába:
// olvasáskor fésüljük rá (src: 'x'), a tanári mentés pedig kiszűri őket – így a
// tanár épp nyitva lévő (régebbi) példánya sem írhatja felül a diák beadását.
import crypto from 'node:crypto'
import { hasSession, json, clientIp } from './security.mjs'
import { loadClass } from './classroomStore.mjs'
import { lockedFor, registerFailure, registerSuccess } from './rateLimit.mjs'

const normCode = (c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)
const same = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))

// Személyes kód + (opcionálisan) a kiválasztott diák azonosítója → { doc, s } vagy { res }
// Feltétel: az osztály jelszavas munkamenete vagy tanári süti, és a helyes kód.
export async function authStudent(req, context, cls, body) {
  if (!hasSession(req, `language-${cls}`) && !hasSession(req, 'teacher')) return { res: json(401, { error: 'locked' }) }
  const code = normCode(body?.code)
  const area = `code-${cls}`
  const ip = clientIp(req, context)
  const wait = await lockedFor(ip, area)
  if (wait > 0) return { res: json(429, { error: 'locked', retryAfter: wait }, { 'Retry-After': String(wait) }) }
  const doc = await loadClass(cls)
  const want = typeof body?.id === 'string' ? body.id : null
  const found = code.length >= 6 ? (doc?.students || []).find((x) => x.code && same(normCode(x.code), code)) : null
  // a kód csak ahhoz a diákhoz nyit, akinek az avatarjára kattintottak
  const s = found && (!want || found.id === want) ? found : null
  if (!s) {
    const { remaining, lockedSeconds } = await registerFailure(ip, area)
    if (lockedSeconds) return { res: json(429, { error: 'locked', retryAfter: lockedSeconds }, { 'Retry-After': String(lockedSeconds) }) }
    return { res: json(401, { error: 'wrong', remaining }) }
  }
  await registerSuccess(ip, area)
  return { doc, s, ip }
}

// ── Szorgalmi feladat ──
// taskId = '<óra kulcsa>~<lépés azonosítója>'; a lépés: role 'extra', beállítás: item.xt
export const TASK_ID = /^\d{4}-\d{2}-\d{2}(@\d{2}:\d{2})?~[A-Za-z0-9_-]{1,40}$/
export function findTask(doc, taskId) {
  if (!TASK_ID.test(taskId || '')) return null
  const [key, itemId] = taskId.split('~')
  const item = (doc?.plans?.[key]?.items || []).find((it) => it.id === itemId && it.role === 'extra')
  return item ? { key, item, xt: cleanXt(item.xt) } : null
}
export function cleanXt(xt) {
  const items = Array.isArray(xt?.items) ? xt.items.slice(0, 60).map((x) => ({ a: String(x?.a || '').slice(0, 300), open: Boolean(x?.open) })) : []
  const n = (v, d) => (Number.isFinite(Number(v)) ? Math.max(0, Math.min(20, Math.round(Number(v)))) : d)
  return { items, px: n(xt?.px, 1), py: n(xt?.py, 1), due: /^\d{4}-\d{2}-\d{2}$/.test(xt?.due || '') ? xt.due : '' }
}

// kis- és nagybetű, szóköz és írásjel nem számít; '/' = elfogadható változatok
export const normAnswer = (s) => String(s || '').normalize('NFKC').toLowerCase()
  .replace(/[’‘`´]/g, "'").replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim()
export function checkAnswers(xt, answers) {
  return xt.items.map((it, i) => {
    if (it.open) return null
    const alts = it.a.split('/').map(normAnswer).filter(Boolean)
    const a = normAnswer(answers?.[i])
    return Boolean(a) && alts.includes(a)
  })
}

// határidő: a megadott nap végéig (magyar idő szerint)
const huToday = () => {
  const hu = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Budapest' }))
  const z = (n) => String(n).padStart(2, '0')
  return `${hu.getFullYear()}-${z(hu.getMonth() + 1)}-${z(hu.getDate())}`
}
export const pastDue = (xt) => Boolean(xt.due) && huToday() > xt.due

// ── Pont-események a diák munkáiból ──
const h10 = (s) => crypto.createHash('sha256').update(s).digest('base64url').slice(0, 10)
const skillId = (doc, key) => [...(doc?.skills?.positive || []), ...(doc?.skills?.negative || [])].find((k) => k.key === key)?.id
export function workEvents(doc, sid, w) {
  const out = []
  const kx = skillId(doc, 'extra_hw'), kp = skillId(doc, 'perfect_hw')
  for (const [taskId, sub] of Object.entries(w?.subs || {})) {
    const base = { s: sid, l: sub.l, st: sub.st, sn: sub.sn || 'Extra task', src: 'x' }
    if (sub.subOk !== false) out.push({ ...base, id: `xs-${h10(taskId)}-${sid}`, k: kx, n: 'Extra task submitted', i: 'art:extra_hw', v: sub.px ?? 1, t: sub.at })
    if (sub.flaw) out.push({ ...base, id: `xf-${h10(taskId)}-${sid}`, k: kp, n: 'Flawless extra task', i: 'art:perfect_hw', v: sub.py ?? 1, t: sub.ft || sub.at })
  }
  for (const r of w?.reqs || []) {
    if (r.status !== 'approved') continue
    out.push({ id: `pr-${r.id}`, s: sid, n: `Privilege: ${r.name}`, i: 'art:ticket', v: -Math.abs(r.cost), t: r.dt || r.at, src: 'x', redeem: true, ...(r.choice ? { dj: r.choice } : {}) })
  }
  return out
}
export function allWorkEvents(doc, map) {
  return Object.entries(map || {}).flatMap(([sid, w]) => ((doc?.students || []).some((s) => s.id === sid) ? workEvents(doc, sid, w) : []))
}
export const stripWorkEvents = (events = []) => events.filter((e) => e?.src !== 'x')

// a diáknak visszaadott beadás (a nyitott kérdéseknél a tanár jelölése)
export const publicSub = (sub) => sub && ({
  a: sub.a || [], open: sub.open || '', photos: sub.photos || [], at: sub.at, upd: sub.upd,
  res: (sub.res || []).map((r, i) => (r == null ? (sub.marks?.[i] ?? null) : r)),
  checked: Boolean(sub.checked), flaw: Boolean(sub.flaw), subOk: sub.subOk !== false, px: sub.px, py: sub.py, first: Boolean(sub.first),
})
