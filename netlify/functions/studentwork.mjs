// A diákok saját munkái – szorgalmi feladat beadása (+ fotók) és kiváltság-kérés
//   POST /api/studentwork/:cls  { code, id, action, … }        – diák, személyes kóddal
//        action: submit { task, answers[], open } | photo { task, data(base64 JPEG) }
//                delphoto { task, photo } | getphoto { task, photo }
//                request { pid, choice? } | cancel { req }
//   GET  /api/studentwork/:cls                                 – tanár: minden beadás és kérés
//   GET  /api/studentwork/:cls?photo=<id>                      – tanár: egy beadott fotó
//   POST /api/studentwork/:cls  { action: 'mark', sid, task, subOk?, flaw?, marks?, checked? } – tanár
//   POST /api/studentwork/:cls  { action: 'decide', sid, req, approve }                         – tanár
// Minden diákadat titkosítva, diákonként külön blobban (classroomStore: work-<cls>-<id>).
// Pont csak a beadásért / hibátlanért / beváltásért keletkezik, és csak az adott diák látja.
// MI-alapú javítás nincs: a zárt kérdéseket egyszerű szövegegyezés ellenőrzi.
import crypto from 'node:crypto'
import { hasSession, json, sameOrigin } from '../lib/security.mjs'
import { isClass, loadClass, loadWork, saveWork, loadAllWork, savePhoto, loadPhoto, deletePhoto, PHOTO_ID, STUDENT_ID } from '../lib/classroomStore.mjs'
import { allowHit } from '../lib/rateLimit.mjs'
import { authStudent, findTask, checkAnswers, pastDue, allWorkEvents, workEvents, publicSub, TASK_ID } from '../lib/studentWork.mjs'

const MAX_BODY = 2.6 * 1024 * 1024 // egy fotó base64-ben + tartalék
const MAX_PHOTO = 1.8 * 1024 * 1024
const MAX_PHOTOS = 4
const isJpeg = (b) => b.length > 4 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff

const editable = (sub, xt) => !sub?.checked && !pastDue(xt)

export default async (req, context) => {
  const cls = context?.params?.cls
  if (!(await isClass(cls))) return json(404, { error: 'class' })
  const teacher = hasSession(req, 'teacher')

  try {
    // ── tanár: lista és fotó ──
    if (req.method === 'GET') {
      if (!teacher) return json(401, { error: 'locked' })
      const photo = new URL(req.url).searchParams.get('photo')
      if (photo) {
        if (!PHOTO_ID.test(photo)) return json(404, { error: 'photo' })
        const data = await loadPhoto(cls, photo)
        if (!data) return json(404, { error: 'photo' })
        return new Response(data, { status: 200, headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'private, max-age=86400', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; sandbox" } })
      }
      const doc = await loadClass(cls)
      const work = await loadAllWork(cls, (doc?.students || []).map((s) => s.id))
      return json(200, { work, events: allWorkEvents(doc, work) }, { 'Cache-Control': 'no-store' })
    }
    if (req.method !== 'POST') return json(405, { error: 'method' }, { Allow: 'GET, POST' })
    if (!sameOrigin(req)) return json(403, { error: 'origin' })
    if (Number(req.headers.get('content-length') || 0) > MAX_BODY) return json(413, { error: 'too-large' })
    const raw = Buffer.from(await req.arrayBuffer())
    if (raw.length > MAX_BODY) return json(413, { error: 'too-large' })
    let body
    try { body = JSON.parse(raw.toString('utf8')) } catch { return json(400, { error: 'body' }) }

    // ── tanár: javítás / jóváhagyás ──
    if (body?.action === 'mark' || body?.action === 'decide') {
      if (!teacher) return json(401, { error: 'locked' })
      const sid = String(body.sid || '')
      if (!STUDENT_ID.test(sid)) return json(400, { error: 'student' })
      const doc = await loadClass(cls)
      if (!(doc?.students || []).some((s) => s.id === sid)) return json(404, { error: 'student' })
      const w = await loadWork(cls, sid)
      if (body.action === 'mark') {
        const sub = w.subs[body.task]
        if (!sub) return json(404, { error: 'task' })
        if (typeof body.subOk === 'boolean') sub.subOk = body.subOk
        if (typeof body.flaw === 'boolean') { sub.flaw = body.flaw; sub.ft = body.flaw ? Date.now() : null }
        if (body.marks && typeof body.marks === 'object') {
          sub.marks = { ...(sub.marks || {}) }
          for (const [i, v] of Object.entries(body.marks)) if (/^\d{1,2}$/.test(i)) { if (v === null) delete sub.marks[i]; else sub.marks[i] = Boolean(v) }
        }
        if (typeof body.checked === 'boolean') sub.checked = body.checked
        else sub.checked = true // bármilyen tanári jelölés lezárja a beadást
      } else {
        const r = w.reqs.find((x) => x.id === body.req)
        if (!r || r.status !== 'pending') return json(404, { error: 'request' })
        r.status = body.approve ? 'approved' : 'declined'
        r.dt = Date.now()
      }
      await saveWork(cls, sid, w)
      return json(200, { ok: true, work: w, events: workEvents(doc, sid, w) })
    }

    // ── diák: személyes kóddal ──
    const auth = await authStudent(req, context, cls, body)
    if (auth.res) return auth.res
    const { doc, s } = auth
    if (!(await allowHit(`${cls}|${s.id}`, 'studentwork', 60, 600))) return json(429, { error: 'slow-down', retryAfter: 600 })
    const w = await loadWork(cls, s.id)
    const action = body?.action

    if (['submit', 'photo', 'delphoto', 'getphoto'].includes(action)) {
      const taskId = String(body.task || '')
      if (!TASK_ID.test(taskId)) return json(400, { error: 'task' })
      const t = findTask(doc, taskId)
      if (!t) return json(404, { error: 'task' })
      let sub = w.subs[taskId]

      if (action === 'getphoto') {
        if (!sub?.photos?.includes(body.photo) || !PHOTO_ID.test(body.photo)) return json(404, { error: 'photo' })
        const data = await loadPhoto(cls, body.photo)
        return data ? new Response(data, { status: 200, headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } }) : json(404, { error: 'photo' })
      }
      if (sub && !editable(sub, t.xt)) return json(409, { error: sub.checked ? 'checked' : 'closed', sub: publicSub(sub) })
      if (!sub && pastDue(t.xt)) return json(409, { error: 'closed' })

      if (action === 'submit') {
        const answers = Array.isArray(body.answers) ? body.answers.slice(0, t.xt.items.length).map((x) => String(x ?? '').slice(0, 300)) : []
        const openText = String(body.open ?? '').slice(0, 5000)
        const res = checkAnswers(t.xt, answers)
        const now = Date.now()
        if (!sub) {
          const closed = res.filter((r) => r !== null)
          const hasOpen = res.some((r) => r === null)
          // automatikus „hibátlan”: csak az első beadásnál, ha minden zárt kérdés jó és nincs nyitott
          const auto = closed.length > 0 && !hasOpen && closed.every(Boolean)
          sub = {
            at: now, l: t.key, st: t.item.id, sn: `Extra task${(t.item.aim || '').trim() ? `: ${t.item.aim.trim().slice(0, 80)}` : ''}`,
            px: t.xt.px, py: t.xt.py, photos: [], first: auto, ...(auto ? { flaw: true, ft: now } : {}),
          }
        }
        Object.assign(sub, { a: answers, open: openText, res, upd: now })
        w.subs[taskId] = sub
        await saveWork(cls, s.id, w)
        return json(200, { ok: true, sub: publicSub(sub), events: workEvents(doc, s.id, w) })
      }
      if (!sub) return json(409, { error: 'submit-first' })
      if (action === 'photo') {
        if ((sub.photos || []).length >= MAX_PHOTOS) return json(409, { error: 'max-photos' })
        const data = Buffer.from(String(body.data || ''), 'base64')
        if (!data.length || data.length > MAX_PHOTO) return json(413, { error: 'photo-size' })
        if (!isJpeg(data)) return json(415, { error: 'photo-type' })
        const id = 'p' + crypto.randomBytes(15).toString('base64url')
        await savePhoto(cls, id, data)
        sub.photos = [...(sub.photos || []), id]
        sub.upd = Date.now()
        await saveWork(cls, s.id, w)
        return json(200, { ok: true, sub: publicSub(sub) })
      }
      if (action === 'delphoto') {
        if (!sub.photos?.includes(body.photo)) return json(404, { error: 'photo' })
        await deletePhoto(cls, body.photo).catch(() => {})
        sub.photos = sub.photos.filter((p) => p !== body.photo)
        sub.upd = Date.now()
        await saveWork(cls, s.id, w)
        return json(200, { ok: true, sub: publicSub(sub) })
      }
    }

    return json(400, { error: 'action' })
  } catch (err) {
    console.error('studentwork failed', cls, err?.message)
    return json(500, { error: 'store' })
  }
}

export const config = { path: '/api/studentwork/:cls' }
