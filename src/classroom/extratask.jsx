import { useCallback, useEffect, useRef, useState } from 'react'
import Avatar from './Avatar.jsx'
import { Sheet, Icon } from './ui.jsx'
import { Art } from './art.jsx'
import { Resource, Linkify } from './plan.jsx'
import { uid, sortStudents, fullName, lessonLabel, getPlan, withSkeleton, splitKey } from './model.js'

/*
  Szorgalmi feladat (Extra task): tanári kulcs + diák beadás + tanári javítás.
  - A megoldókulcs a lépésen van (item.xt), a diákok böngészőjébe sosem kerül ki.
  - A zárt kérdéseket a szerver javítja (kis-/nagybetű, szóköz, írásjel nem számít,
    '/' = elfogadott változatok). MI-alapú javítás nincs.
  - Pont: „Extra task submitted” +X (beadáskor) és „Flawless” +Y – csak az adott diák látja.
*/

export const taskIdOf = (key, itemId) => `${key}~${itemId}`
export const XT_DEFAULT = { items: [], px: 1, py: 1, due: '' }
export const xtOf = (it) => ({ ...XT_DEFAULT, ...(it?.xt || {}), items: it?.xt?.items || [] })
const fmtDue = (d) => (d ? new Date(`${d}T12:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : '')
const todayIso = () => { const d = new Date(); const z = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}` }
export const isPastDue = (due) => Boolean(due) && todayIso() > due

// ── Tanár: a kulcs, a pontok és a határidő a lépés szerkesztőjében ──
export function ExtraTaskSetup({ item, onChange }) {
  const xt = xtOf(item)
  const [bulk, setBulk] = useState(null)
  const set = (patch) => onChange((it) => ({ xt: { ...xtOf(it), ...(typeof patch === 'function' ? patch(xtOf(it)) : patch) } }))
  const setItem = (id, patch) => set((x) => ({ items: x.items.map((q) => (q.id === id ? { ...q, ...patch } : q)) }))
  const addBulk = () => {
    const lines = bulk.split(/\r?\n/).map((l) => l.replace(/^\s*\(?\d+[.)]?\s*/, '').trim()).filter(Boolean)
    if (lines.length) set((x) => ({ items: [...x.items, ...lines.slice(0, 60 - x.items.length).map((a) => ({ id: uid(), a: /^\?+$|^open$/i.test(a) ? '' : a, open: /^\?+$|^open$/i.test(a) }))] }))
    setBulk(null)
  }
  return (
    <div className="cr-xtset">
      <h4><Art name="perfect_hw" className="cr-art cr-art--xs" /> Answer key <small>students never see it</small></h4>
      {xt.items.length > 0 && (
        <ol className="cr-xtset__list">
          {xt.items.map((q, i) => (
            <li key={q.id}>
              <b>{i + 1}.</b>
              {q.open
                ? <span className="cr-xtset__open">Open answer – you mark it</span>
                : <input value={q.a} onChange={(e) => setItem(q.id, { a: e.target.value })} placeholder="answer / other accepted answer" aria-label={`Answer ${i + 1}`} maxLength={300} />}
              <span className="cr-seg cr-seg--xs" role="radiogroup" aria-label={`Item ${i + 1} type`}>
                <button type="button" role="radio" aria-checked={!q.open} className={!q.open ? 'is-active' : ''} onClick={() => setItem(q.id, { open: false })} title="Checked automatically">Closed</button>
                <button type="button" role="radio" aria-checked={q.open} className={q.open ? 'is-active' : ''} onClick={() => setItem(q.id, { open: true })} title="Free text – you mark it">Open</button>
              </span>
              <button type="button" className="cr-iconbtn cr-iconbtn--sm" onClick={() => set((x) => ({ items: x.items.filter((y) => y.id !== q.id) }))} aria-label={`Delete item ${i + 1}`}><Icon.close /></button>
            </li>
          ))}
        </ol>
      )}
      {bulk !== null ? (
        <div className="cr-xtset__bulk">
          <textarea rows={5} value={bulk} onChange={(e) => setBulk(e.target.value)} autoFocus
            placeholder={'One answer per line, e.g.\n1. went\n2. has been / \'s been\n3. ?   ← a question mark = open answer'} aria-label="Answers, one per line" />
          <div className="cr-form__actions">
            <button type="button" className="cr-btn cr-btn--sm" onClick={() => setBulk(null)}>Cancel</button>
            <button type="button" className="cr-btn cr-btn--sm cr-btn--primary" onClick={addBulk} disabled={!bulk.trim()}>Add answers</button>
          </div>
        </div>
      ) : (
        <div className="cr-xtset__bar">
          <button type="button" className="cr-btn cr-btn--sm" onClick={() => set((x) => ({ items: [...x.items, { id: uid(), a: '', open: false }] }))} disabled={xt.items.length >= 60}><Icon.plus />Add item</button>
          <button type="button" className="cr-btn cr-btn--sm" onClick={() => setBulk('')} disabled={xt.items.length >= 60}><Icon.list />Paste a list</button>
        </div>
      )}
      <p className="cr-muted cr-xtset__note">Closed answers are checked automatically: capitals, spaces and punctuation don’t count; separate accepted alternatives with “/”. Attach the worksheet (PDF) with <b>File</b> above.</p>
      <div className="cr-xtset__row">
        <label className="cr-field cr-field--num"><span>Handed in</span><span className="cr-xtset__pts">+<input type="number" min="0" max="20" value={xt.px} onChange={(e) => set({ px: Math.max(0, Math.min(20, Math.round(Number(e.target.value) || 0))) })} /></span></label>
        <label className="cr-field cr-field--num"><span>Flawless</span><span className="cr-xtset__pts">+<input type="number" min="0" max="20" value={xt.py} onChange={(e) => set({ py: Math.max(0, Math.min(20, Math.round(Number(e.target.value) || 0))) })} /></span></label>
        <label className="cr-field"><span>Deadline (optional)</span>
          <span className="cr-xtset__due"><input type="date" value={xt.due} onChange={(e) => set({ due: e.target.value })} />{xt.due && <button type="button" className="cr-link" onClick={() => set({ due: '' })}>Clear</button>}</span>
        </label>
      </div>
    </div>
  )
}

// ── Fotó: kicsinyítés a böngészőben (~1600 px, JPEG), base64 ──
const MAX_SIDE = 1600
async function decode(file) {
  if (window.createImageBitmap) {
    try { return await createImageBitmap(file, { imageOrientation: 'from-image' }) } catch { /* tovább */ }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    return img
  } finally { setTimeout(() => URL.revokeObjectURL(url), 1000) }
}
export async function photoToJpeg(file) {
  const src = await decode(file)
  const w = src.width, h = src.height
  const scale = Math.min(1, MAX_SIDE / Math.max(w, h))
  const c = document.createElement('canvas')
  c.width = Math.round(w * scale); c.height = Math.round(h * scale)
  const g = c.getContext('2d')
  g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height)
  g.drawImage(src, 0, 0, c.width, c.height)
  let blob = null
  for (const q of [0.82, 0.7, 0.55]) {
    blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', q))
    if (blob && blob.size < 1.6 * 1024 * 1024) break
  }
  if (!blob) throw new Error('encode')
  const data = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(',')[1]); fr.onerror = rej; fr.readAsDataURL(blob) })
  return { data, url: URL.createObjectURL(blob) }
}

async function workPost(cls, body) {
  const res = await fetch(`/api/studentwork/${cls}`, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  if (!res.ok) {
    const b = await res.json().catch(() => ({}))
    throw Object.assign(new Error(b.error || res.status), { status: res.status, body: b })
  }
  return res.headers.get('content-type')?.includes('image/') ? res.blob() : res.json()
}
const ERR = {
  closed: 'The deadline has passed – you can’t change this any more.',
  checked: 'Your teacher has already checked this.',
  'slow-down': 'Too many saves in a short time – wait a few minutes.',
  'max-photos': 'You can add up to 4 photos.',
  'photo-size': 'This photo is too large.',
  'photo-type': 'This photo format isn’t supported – try a JPEG or a screenshot.',
  wrong: 'Your code didn’t work – open your report again.',
}
const errText = (e) => ERR[e?.body?.error] || ERR[e?.message] || 'Something went wrong – please try again.'

function Mark({ ok }) {
  if (ok == null) return <span className="cr-mark is-wait" title="Your teacher will mark it">?</span>
  return <span className={`cr-mark ${ok ? 'is-ok' : 'is-bad'}`} title={ok ? 'Correct' : 'Not quite'}>{ok ? <Icon.check /> : <Icon.close />}</span>
}

// ── Diák: kitöltés és beadás (a saját kódjával) ──
export function ExtraTaskSheet({ cls, code, me, item, taskId, sub: initial, onSaved, onClose }) {
  const t = item.task || { kinds: [], px: 1, py: 1, due: '' }
  const [sub, setSub] = useState(initial || null)
  const [answers, setAnswers] = useState(() => t.kinds.map((_, i) => initial?.a?.[i] || ''))
  const [openText, setOpenText] = useState(initial?.open || '')
  const [queue, setQueue] = useState([]) // még nem feltöltött fotók: { data, url }
  const [shots, setShots] = useState({}) // feltöltött fotók előnézete: id → url
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const fileRef = useRef(null)
  const locked = Boolean(sub?.checked) || isPastDue(t.due)
  const hasOpen = t.kinds.includes('o')
  const photoCount = (sub?.photos?.length || 0) + queue.length
  const base = { code, id: me.id, task: taskId }

  // a már feltöltött fotók előnézete (a saját kóddal kérve)
  useEffect(() => {
    let alive = true
    for (const p of sub?.photos || []) {
      if (shots[p]) continue
      workPost(cls, { ...base, action: 'getphoto', photo: p }).then((b) => { if (alive) setShots((s) => ({ ...s, [p]: URL.createObjectURL(b) })) }).catch(() => {})
    }
    return () => { alive = false }
  }, [sub?.photos?.join('|')]) // eslint-disable-line react-hooks/exhaustive-deps

  const upload = async (s0, list) => {
    let s = s0
    for (const q of list) {
      const r = await workPost(cls, { ...base, action: 'photo', data: q.data })
      const id = r.sub.photos[r.sub.photos.length - 1]
      setShots((m) => ({ ...m, [id]: q.url }))
      s = r.sub
      setSub(s)
    }
    return s
  }
  const pick = async (files) => {
    setMsg('')
    const room = 4 - photoCount
    const picked = [...files].slice(0, Math.max(0, room))
    if (files.length > room) setMsg(ERR['max-photos'])
    setBusy(true)
    try {
      const ready = []
      for (const f of picked) ready.push(await photoToJpeg(f))
      if (sub) { const s = await upload(sub, ready); onSaved?.(s) } else setQueue((q) => [...q, ...ready])
    } catch (e) { setMsg(e?.message === 'encode' || !e?.status ? ERR['photo-type'] : errText(e)) }
    finally { setBusy(false) }
  }
  const removePhoto = async (p) => {
    setBusy(true); setMsg('')
    try { const r = await workPost(cls, { ...base, action: 'delphoto', photo: p }); setSub(r.sub); onSaved?.(r.sub) } catch (e) { setMsg(errText(e)) } finally { setBusy(false) }
  }
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setMsg('')
    try {
      const r = await workPost(cls, { ...base, action: 'submit', answers, open: openText })
      let s = r.sub
      setSub(s)
      if (queue.length) { s = await upload(s, queue); setQueue([]) }
      onSaved?.(s, r.events)
      setMsg('saved')
    } catch (err) {
      if (err.body?.sub) setSub(err.body.sub)
      setMsg(errText(err))
    } finally { setBusy(false) }
  }
  const closedRes = (sub?.res || []).filter((r, i) => t.kinds[i] === 'c')
  const right = closedRes.filter(Boolean).length

  return (
    <Sheet title={item.aim || 'Extra task'} onClose={onClose} wide className="cr-xtsheet">
      <form className="cr-form" onSubmit={submit}>
        <div className="cr-xtsheet__meta">
          <span className="cr-chip"><b>+{t.px}</b> for handing in</span>
          {t.py > 0 && <span className="cr-chip"><b>+{t.py}</b> if flawless</span>}
          {t.due && <span className={`cr-chip ${isPastDue(t.due) ? 'cr-chip--neg' : 'cr-chip--muted'}`}>Deadline: {fmtDue(t.due)}</span>}
        </div>
        {item.activity && <p className="cr-xtsheet__text"><Linkify text={item.activity} /></p>}
        {item.resources?.length > 0 && <div className="cr-tcard__res">{item.resources.map((r) => <Resource key={r.id} r={r} cls={cls} />)}</div>}

        {sub && (
          <div className={`cr-xtstatus ${sub.checked ? 'is-checked' : ''}`} role="status">
            <Art name="extra_hw" className="cr-art cr-art--md" />
            <span>
              <b>{sub.checked ? 'Checked by your teacher' : 'Handed in'}</b>
              <small>
                {closedRes.length > 0 && `${right} / ${closedRes.length} correct · `}
                {sub.subOk ? `+${sub.px ?? t.px} points` : 'no points for this one'}
                {sub.flaw ? ` · Flawless +${sub.py ?? t.py}` : ''}
                {!sub.checked && !locked && ' · you can still change it'}
              </small>
            </span>
          </div>
        )}

        {t.kinds.length > 0 && (
          <ol className="cr-xtanswers">
            {t.kinds.map((k, i) => (
              <li key={i} className={sub?.res?.[i] === true ? 'is-ok' : sub?.res?.[i] === false ? 'is-bad' : ''}>
                <b>{i + 1}.</b>
                {k === 'c'
                  ? <input value={answers[i]} onChange={(e) => setAnswers((a) => a.map((x, j) => (j === i ? e.target.value : x)))} disabled={locked} maxLength={300} aria-label={`Answer ${i + 1}`} autoComplete="off" />
                  : <span className="cr-xtanswers__open">Open answer – write it in the box below</span>}
                {sub && <Mark ok={sub.res?.[i]} />}
              </li>
            ))}
          </ol>
        )}
        {(hasOpen || !t.kinds.length) && (
          <label className="cr-field">
            <span>{hasOpen ? 'Your answers to the open questions (write the number first)' : 'Your answer'}</span>
            <textarea rows={6} value={openText} onChange={(e) => setOpenText(e.target.value)} disabled={locked} maxLength={5000} />
          </label>
        )}

        <div className="cr-xtphotos">
          <span className="cr-xtphotos__label"><Art name="clip" className="cr-art cr-art--xs" /> Photos of your work <small>optional · max 4 pages</small></span>
          <div className="cr-xtphotos__row">
            {(sub?.photos || []).map((p, i) => (
              <figure key={p} className="cr-xtphoto">
                {shots[p] ? <img src={shots[p]} alt={`Page ${i + 1}`} /> : <span className="cr-xtphoto__ph">Page {i + 1}</span>}
                {!locked && <button type="button" className="cr-iconbtn cr-iconbtn--sm" onClick={() => removePhoto(p)} aria-label={`Remove page ${i + 1}`} disabled={busy}><Icon.close /></button>}
              </figure>
            ))}
            {queue.map((q, i) => (
              <figure key={q.url} className="cr-xtphoto is-queued">
                <img src={q.url} alt={`New page ${i + 1}`} />
                <button type="button" className="cr-iconbtn cr-iconbtn--sm" onClick={() => setQueue((x) => x.filter((y) => y !== q))} aria-label="Remove"><Icon.close /></button>
              </figure>
            ))}
            {!locked && photoCount < 4 && (
              <button type="button" className="cr-xtphoto cr-xtphoto--add" onClick={() => fileRef.current?.click()} disabled={busy}><Icon.plus /><span>Add photo</span></button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { const f = [...e.target.files]; e.target.value = ''; if (f.length) pick(f) }} />
          {queue.length > 0 && <small className="cr-muted">These photos are sent when you hand in.</small>}
        </div>

        {msg && msg !== 'saved' && <p className="cr-codeform__err" role="alert">{msg}</p>}
        {msg === 'saved' && <p className="cr-xtsaved" role="status"><Icon.check /> Saved – only you and your teacher can see it.</p>}
        <div className="cr-form__actions">
          {sub?.first && <span className="cr-muted">Flawless on the first try!</span>}
          {!sub?.first && sub && !sub.flaw && closedRes.length > 0 && !hasOpen && <span className="cr-muted">“Flawless” points only count on the first try.</span>}
          <span className="cr-spacer" />
          <button type="button" className="cr-btn" onClick={onClose}>Close</button>
          {!locked && <button type="submit" className="cr-btn cr-btn--primary" disabled={busy}>{busy ? 'Saving…' : sub ? 'Save changes' : 'Hand in'}</button>}
        </div>
      </form>
    </Sheet>
  )
}

// ── Tanár: a beadások betöltése (a tanári sütivel) ──
export function useStudentWork(cls, enabled = true) {
  const [work, setWork] = useState(null)
  const [events, setEvents] = useState(null) // a beadásokból / beváltásokból képzett pont-események
  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/studentwork/${cls}`, { credentials: 'same-origin', cache: 'no-store' })
      if (!res.ok) throw new Error(res.status)
      const d = await res.json()
      setWork(d.work || {})
      setEvents(d.events || [])
      return d
    } catch { return null }
  }, [cls])
  useEffect(() => { setWork(null); if (enabled) load() }, [load, enabled])
  const post = useCallback(async (body) => {
    const res = await fetch(`/api/studentwork/${cls}`, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!res.ok) throw new Error(res.status)
    const d = await res.json()
    setWork((w) => ({ ...(w || {}), [body.sid]: d.work }))
    setEvents((ev) => [...(ev || []).filter((e) => e.s !== body.sid), ...(d.events || [])])
    return d
  }, [cls])
  return { work, events, reload: load, post }
}
// a még nem javított beadások száma (a tanári jelvényhez)
export const pendingCount = (work) => Object.values(work || {}).reduce((n, w) => n + Object.values(w.subs || {}).filter((s) => !s.checked).length, 0)

// a feladatok listája a beadásokból (óra + lépés), időrendben
function tasksOf(doc, work) {
  const ids = new Set()
  for (const w of Object.values(work || {})) for (const k of Object.keys(w.subs || {})) ids.add(k)
  return [...ids].map((id) => {
    const [key, itemId] = id.split('~')
    const item = withSkeleton(getPlan(doc, key)).items.find((x) => x.id === itemId)
    const subs = Object.entries(work).filter(([, w]) => w.subs?.[id]).map(([sid, w]) => ({ sid, sub: w.subs[id] }))
    return { id, key, item, subs, title: item?.aim || subs[0]?.sub?.sn?.replace(/^Extra task:?\s*/, '') || 'Extra task' }
  }).sort((a, b) => (a.key < b.key ? 1 : -1))
}

// ── Tanár: javító nézet – egy feladat beadásai, a válaszok a kulcs mellett ──
export function ExtraReview({ doc, cls, work, post, initialTask = null, onClose }) {
  const tasks = tasksOf(doc, work)
  const [taskId, setTaskId] = useState(initialTask || tasks.find((t) => t.subs.some((s) => !s.sub.checked))?.id || tasks[0]?.id || null)
  const [busy, setBusy] = useState(null)
  const [err, setErr] = useState('')
  const [zoom, setZoom] = useState(null)
  const task = tasks.find((t) => t.id === taskId) || (initialTask ? { id: initialTask, ...(() => { const [key, itemId] = initialTask.split('~'); return { key, item: withSkeleton(getPlan(doc, key)).items.find((x) => x.id === itemId), subs: [] } })() } : null)
  const xt = xtOf(task?.item)
  const mark = async (sid, patch) => {
    setBusy(sid); setErr('')
    try { await post({ action: 'mark', sid, task: task.id, ...patch }) } catch { setErr('Could not save – try again.') } finally { setBusy(null) }
  }
  const byId = Object.fromEntries(doc.students.map((s) => [s.id, s]))
  const subs = (task?.subs || []).filter((x) => byId[x.sid]).sort((a, b) => (a.sub.checked - b.sub.checked) || (a.sub.at - b.sub.at))
  const missing = task ? sortStudents(doc.students).filter((s) => !subs.some((x) => x.sid === s.id)) : []

  return (
    <Sheet title="Extra tasks" onClose={onClose} wide className="cr-xtreview">
      {!tasks.length && !task ? (
        <div className="cr-empty"><span className="cr-empty__icon"><Art name="extra_hw" className="cr-art cr-art--xl" /></span><b>No extra tasks handed in yet.</b></div>
      ) : (
        <>
          {tasks.length > 0 && (
            <label className="cr-board__pick cr-xtreview__pick">
              <span className="sr-only">Extra task</span>
              <select value={taskId || ''} onChange={(e) => setTaskId(e.target.value)}>
                {!tasks.some((t) => t.id === taskId) && task && <option value={task.id}>{task.item?.aim || 'Extra task'} · {lessonLabel(task.key, undefined, doc)}</option>}
                {tasks.map((t) => {
                  const open = t.subs.filter((s) => !s.sub.checked).length
                  return <option key={t.id} value={t.id}>{t.title} · {lessonLabel(t.key, undefined, doc)} · {t.subs.length} handed in{open ? ` · ${open} to check` : ''}</option>
                })}
              </select>
            </label>
          )}
          {task && (
            <p className="cr-muted cr-xtreview__info">
              {xt.items.length} item{xt.items.length === 1 ? '' : 's'} · +{xt.px} handed in · +{xt.py} flawless{xt.due ? ` · deadline ${fmtDue(xt.due)}` : ''}
            </p>
          )}
          {err && <p className="cr-codeform__err" role="alert">{err}</p>}
          {!subs.length && <p className="cr-hint">Nobody has handed this in yet.</p>}
          <div className="cr-xtsubs">
            {subs.map(({ sid, sub }) => {
              const s = byId[sid]
              const res = sub.res || []
              const closed = res.filter((r) => r !== null)
              return (
                <article key={sid} className={`cr-xtsub ${sub.checked ? 'is-checked' : ''}`} aria-busy={busy === sid}>
                  <header>
                    <Avatar a={s.avatar} />
                    <span className="cr-xtsub__who"><b>{fullName(s)}</b><small>{new Date(sub.upd || sub.at).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}{closed.length ? ` · ${closed.filter(Boolean).length}/${closed.length} auto-correct` : ''}</small></span>
                    {sub.checked ? <span className="cr-chip">Checked</span> : <span className="cr-chip cr-chip--muted">To check</span>}
                  </header>
                  {xt.items.length > 0 && (
                    <table className="cr-xtsub__table">
                      <thead><tr><th>#</th><th>Answer</th><th>Key</th><th /></tr></thead>
                      <tbody>
                        {xt.items.map((q, i) => {
                          const r = res[i] ?? null
                          const m = sub.marks?.[i]
                          return (
                            <tr key={q.id || i} className={r === true || m === true ? 'is-ok' : r === false || m === false ? 'is-bad' : ''}>
                              <td>{i + 1}</td>
                              <td>{q.open ? <i className="cr-muted">open – see text</i> : (sub.a?.[i] || <i className="cr-muted">empty</i>)}</td>
                              <td>{q.open ? '—' : q.a}</td>
                              <td>
                                {q.open || r === null ? (
                                  <span className="cr-xtsub__marks">
                                    <button className={m === true ? 'is-on is-ok' : ''} onClick={() => mark(sid, { marks: { [i]: m === true ? null : true } })} aria-label="Correct" disabled={busy === sid}><Icon.check /></button>
                                    <button className={m === false ? 'is-on is-bad' : ''} onClick={() => mark(sid, { marks: { [i]: m === false ? null : false } })} aria-label="Wrong" disabled={busy === sid}><Icon.close /></button>
                                  </span>
                                ) : <Mark ok={r} />}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                  {sub.open && <p className="cr-xtsub__open">{sub.open}</p>}
                  {sub.photos?.length > 0 && (
                    <div className="cr-xtphotos__row">
                      {sub.photos.map((p, i) => (
                        <button key={p} className="cr-xtphoto" onClick={() => setZoom(`/api/studentwork/${cls}?photo=${p}`)} aria-label={`Open page ${i + 1}`}>
                          <img src={`/api/studentwork/${cls}?photo=${p}`} alt={`Page ${i + 1}`} loading="lazy" />
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="cr-xtsub__actions">
                    <button className={`cr-btn cr-btn--sm ${sub.subOk !== false ? 'is-on' : ''}`} onClick={() => mark(sid, { subOk: sub.subOk === false })} disabled={busy === sid} aria-pressed={sub.subOk !== false}>
                      <Art name="extra_hw" className="cr-art cr-art--xs" />Handed in +{sub.px ?? xt.px}
                    </button>
                    <button className={`cr-btn cr-btn--sm ${sub.flaw ? 'is-on' : ''}`} onClick={() => mark(sid, { flaw: !sub.flaw })} disabled={busy === sid} aria-pressed={Boolean(sub.flaw)}>
                      <Art name="perfect_hw" className="cr-art cr-art--xs" />Flawless +{sub.py ?? xt.py}
                    </button>
                    <span className="cr-spacer" />
                    <button className="cr-btn cr-btn--sm cr-btn--primary" onClick={() => mark(sid, { checked: !sub.checked })} disabled={busy === sid}>
                      {sub.checked ? 'Reopen for edits' : <><Icon.check />Mark as checked</>}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
          {task && missing.length > 0 && <p className="cr-muted cr-xtreview__missing">Not handed in: {missing.map((s) => s.first).join(', ')}</p>}
        </>
      )}
      {zoom && (
        <div className="cr-xtzoom" onClick={() => setZoom(null)} role="dialog" aria-label="Photo">
          <img src={zoom} alt="Handed-in page" />
        </div>
      )}
    </Sheet>
  )
}

// a lecke dátuma (a diák beadás-listájához)
export const taskLessonLabel = (taskId, doc) => lessonLabel(splitKey(taskId.split('~')[0]).date, { weekday: 'short', day: 'numeric', month: 'short' }, doc)
