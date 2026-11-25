import { useRef, useState } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import { Sheet, Icon } from './ui.jsx'
import {
  LESSON_MIN, ORG_FORMS, TAGS, WEEKDAYS, addMinutes, dayKey, getPlan, lessonLabel, lessonTimeline, newItem, nextLessonKey,
  splitKey, tagOf, uid, previousHomework, withSkeleton, TASK_TAGS,
} from './model.js'

/*
  Óraterv – osztályonként, naponként (előre több alkalomra is).
  Kártyák (bemelegítés / feladat / házi feladat) skill-címkékkel és
  forrásokkal: link, kép/képernyőkép, hangfájl, dokumentum.
  A fájlok titkosítva a szerverre kerülnek (/api/classfile), és csak az
  osztály jelszavával vagy tanárként érhetők el.
*/

// ── Dátum-segédek ──
const parseDay = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d) }
export const dayLabel = (k, opts = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }) => parseDay(k).toLocaleDateString('en-GB', opts)

// ── Fájlok ──
export const fileUrl = (cls, id) => `/api/classfile/${cls}/${id}`
const MAX_UPLOAD = 5.5 * 1024 * 1024
const EXT_TYPES = {
  pdf: 'application/pdf', mp3: 'audio/mpeg', m4a: 'audio/mp4', wav: 'audio/wav', ogg: 'audio/ogg',
  mp4: 'video/mp4', webm: 'video/webm', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp',
  doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: 'application/vnd.ms-powerpoint', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  odt: 'application/vnd.oasis.opendocument.text', txt: 'text/plain', zip: 'application/zip',
}
const typeOf = (f) => f.type || EXT_TYPES[(f.name || '').split('.').pop().toLowerCase()] || 'application/octet-stream'

// Nagy képek (pl. képernyőképek) kicsinyítése feltöltés előtt
async function prepare(file) {
  let type = typeOf(file)
  let name = file.name || 'file'
  if (/^image\/(png|jpeg|webp)$/.test(type) && file.size > 350 * 1024 && window.createImageBitmap) {
    try {
      const bmp = await createImageBitmap(file)
      const scale = Math.min(1, 1800 / Math.max(bmp.width, bmp.height))
      const c = document.createElement('canvas')
      c.width = Math.round(bmp.width * scale)
      c.height = Math.round(bmp.height * scale)
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height)
      const blob = await new Promise((r) => c.toBlob(r, 'image/webp', 0.86))
      if (blob && blob.size < file.size) { file = blob; type = 'image/webp'; name = name.replace(/\.\w+$/, '') + '.webp' }
    } catch { /* marad az eredeti */ }
  }
  if (/^image\.(png|webp)$/i.test(name)) name = `screenshot-${new Date().toLocaleTimeString('en-GB').replace(/:/g, '')}.${name.split('.').pop()}`
  return { body: file, type, name }
}

async function uploadFile(cls, file) {
  const { body, type, name } = await prepare(file)
  if (body.size > MAX_UPLOAD) throw new Error(`“${name}” is too large (max 5.5 MB). Use a link for large video/audio files.`)
  const res = await fetch(`/api/classfile/${cls}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': type, 'X-File-Name': encodeURIComponent(name) },
    body,
  })
  if (res.status === 415) throw new Error(`“${name}”: this file type can't be uploaded.`)
  if (!res.ok) throw new Error(`“${name}” couldn't be uploaded.`)
  const f = await res.json()
  return { id: uid(), type: 'file', fileId: f.id, name: f.name, mime: f.type, size: f.size }
}

const removeFile = (cls, r) => {
  if (r.type === 'file' && r.fileId) fetch(fileUrl(cls, r.fileId), { method: 'DELETE', credentials: 'same-origin' }).catch(() => {})
}

const normalizeUrl = (u) => {
  const s = u.trim()
  if (!s) return null
  try { return new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`).href } catch { return null }
}
const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, '') } catch { return u } }
const fmtSize = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} kB`)

// ── Forrás megjelenítése (tanár és diák is ezt látja) ──
export function Resource({ r, cls, onRemove }) {
  const url = r.type === 'file' ? fileUrl(cls, r.fileId) : r.url
  const mime = r.mime || ''
  let body
  if (r.type === 'file' && mime.startsWith('image/')) {
    body = <a href={url} target="_blank" rel="noopener noreferrer" className="cr-res__img"><img src={url} alt={r.name} loading="lazy" /></a>
  } else if (r.type === 'file' && mime.startsWith('audio/')) {
    body = <div className="cr-res__audio"><span>🎧 {r.name}</span><audio controls preload="none" src={url} /></div>
  } else if (r.type === 'file' && mime.startsWith('video/')) {
    body = <video className="cr-res__video" controls preload="none" src={url} />
  } else if (r.type === 'file') {
    const icon = mime.includes('pdf') ? '📕' : /word|opendocument\.text/.test(mime) ? '📄' : /presentation|powerpoint/.test(mime) ? '📊' : /sheet|excel/.test(mime) ? '📈' : '📎'
    body = (
      <a href={url} target="_blank" rel="noopener noreferrer" className="cr-res__chip">
        <span aria-hidden="true">{icon}</span><span className="cr-res__name">{r.name}</span>{r.size ? <small>{fmtSize(r.size)}</small> : null}
      </a>
    )
  } else {
    body = (
      <a href={url} target="_blank" rel="noopener noreferrer" className="cr-res__chip cr-res__chip--link">
        <span aria-hidden="true">🔗</span><span className="cr-res__name">{r.name || hostOf(url)}</span><small>{hostOf(url)}</small>
      </a>
    )
  }
  return (
    <div className="cr-res">
      {body}
      {onRemove && <button className="cr-iconbtn cr-iconbtn--sm cr-res__rm" onClick={onRemove} aria-label={`Remove ${r.name || 'resource'}`}><Icon.close /></button>}
    </div>
  )
}

// Linkek a leírásban kattinthatók legyenek
export function Linkify({ text }) {
  const parts = String(text || '').split(/(https?:\/\/[^\s]+)/g)
  return parts.map((p, i) => (/^https?:\/\//.test(p) ? <a key={i} href={p} target="_blank" rel="noopener noreferrer">{hostOf(p)}</a> : p))
}

// ── Tanári szerkesztő ──
// Fix váz: 1. Warmer, 2. Homework review | saját feladatok (húzhatók) | Future homework, Self-reflection
export function PlanEditor({ doc, update, cls, onClose, onBack, onOpenSettings }) {
  const timeline = lessonTimeline(doc)
  const hasSchedule = (doc.schedule || []).length > 0
  const [key, setKey] = useState(() => nextLessonKey(doc) || dayKey())
  const [open, setOpen] = useState(null)
  const [busy, setBusy] = useState(0)
  const [error, setError] = useState('')
  const plan = withSkeleton(getPlan(doc, key))
  const { date, time } = splitKey(key)
  const prevHw = previousHomework(doc, key)
  const length = doc.lessonLength || LESSON_MIN
  const total = plan.items.reduce((s, it) => s + (Number(it.minutes) || 0), 0)
  const left = length - total
  const head = plan.items.filter((it) => it.role === 'warmer' || it.role === 'hwreview')
  const middle = plan.items.filter((it) => !it.role)
  const tail = plan.items.filter((it) => it.role === 'homework' || it.role === 'reflection')

  const idx = timeline.indexOf(key)
  const step = (dir) => {
    setOpen(null)
    if (hasSchedule && timeline.length) {
      const i = idx >= 0 ? idx + dir : dir > 0 ? timeline.findIndex((k) => k > key) : timeline.filter((k) => k < key).length - 1
      if (timeline[i]) setKey(timeline[i])
      return
    }
    const d = new Date(`${date}T12:00`)
    d.setDate(d.getDate() + dir)
    setKey(dayKey(d))
  }
  const nextKey = nextLessonKey(doc)
  const upcoming = timeline.filter((k) => !nextKey || k >= nextKey).slice(0, 12)

  const setPlan = (fn) => update((d) => {
    const next = withSkeleton(fn(withSkeleton(getPlan(d, key))))
    const plans = { ...(d.plans || {}), [key]: next }
    const today = { ...(d.today || {}) }
    if (time && plans[date] && key !== date) delete plans[date]
    delete today[date]
    return { ...d, plans, today }
  })
  const setItem = (id, patch) => setPlan((p) => ({ ...p, items: p.items.map((it) => (it.id === id ? { ...it, ...(typeof patch === 'function' ? patch(it) : patch) } : it)) }))
  const addItem = () => {
    const it = newItem()
    setPlan((p) => {
      const items = [...p.items]
      items.splice(items.findIndex((x) => x.role === 'homework'), 0, it) // a Future homework elé
      return { ...p, items }
    })
    setOpen(it.id)
  }
  const removeItem = (it) => {
    if (it.resources?.length && !window.confirm('This step and its uploaded files will be deleted. Continue?')) return
    it.resources?.forEach((r) => removeFile(cls, r))
    setPlan((p) => ({ ...p, items: p.items.filter((x) => x.id !== it.id) }))
  }
  const reorderMiddle = (mid) => setPlan((p) => ({ ...p, items: [...p.items.filter((x) => x.role === 'warmer' || x.role === 'hwreview'), ...mid, ...p.items.filter((x) => x.role === 'homework' || x.role === 'reflection')] }))
  const moveMiddle = (i, dir) => {
    const a = [...middle]
    ;[a[i + dir], a[i]] = [a[i], a[i + dir]]
    reorderMiddle(a)
  }
  const addFiles = async (itemId, files) => {
    setError('')
    for (const f of files) {
      setBusy((n) => n + 1)
      try {
        const r = await uploadFile(cls, f)
        setItem(itemId, (it) => ({ resources: [...(it.resources || []), r] }))
      } catch (e) {
        setError(e.message)
      } finally {
        setBusy((n) => n - 1)
      }
    }
  }

  // kezdési időpontok a teljes sorrend szerint
  let acc = 0
  const startOf = {}
  plan.items.forEach((it) => { startOf[it.id] = addMinutes(time, acc); acc += Number(it.minutes) || 0 })
  const stepNo = Object.fromEntries(plan.items.map((it, i) => [it.id, i + 1]))

  const row = (it, extra = {}) => (
    <PlanRow
      key={it.id} item={it} step={stepNo[it.id]} start={startOf[it.id]} cls={cls}
      review={it.role === 'hwreview' ? prevHw : undefined}
      open={open === it.id} onToggle={() => setOpen(open === it.id ? null : it.id)}
      onChange={(patch) => setItem(it.id, patch)}
      onFiles={(files) => addFiles(it.id, files)}
      {...extra}
    />
  )

  return (
    <Sheet title="Lesson plan" color="#E0B33A" icon={<Icon.sun />} onClose={onClose} onBack={onBack} wide className="cr-sheet--darktext cr-plan cr-plan--xl">
      <div className="cr-plan__nav">
        <button className="cr-iconbtn" onClick={() => step(-1)} aria-label="Previous lesson"><Icon.back /></button>
        <div className="cr-plan__lesson">
          {hasSchedule ? (
            <select value={key} onChange={(e) => { setKey(e.target.value); setOpen(null) }} aria-label="Lesson">
              {!upcoming.includes(key) && <option value={key}>{lessonLabel(key, { weekday: 'long', day: 'numeric', month: 'long' })}</option>}
              {upcoming.map((k) => (
                <option key={k} value={k}>
                  {lessonLabel(k, { weekday: 'long', day: 'numeric', month: 'long' })}{k === nextKey ? ' (next)' : ''}{doc.plans?.[k] ? ' ✓' : ''}
                </option>
              ))}
            </select>
          ) : (
            <label className="cr-plan__date">
              <span>{lessonLabel(key, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <input type="date" value={date} onChange={(e) => e.target.value && setKey(e.target.value)} aria-label="Date" />
            </label>
          )}
        </div>
        <button className="cr-iconbtn" onClick={() => step(1)} aria-label="Next lesson"><Icon.next /></button>
      </div>
      {!hasSchedule && (
        <p className="cr-hint cr-hint--center">
          Tip: add your weekly timetable in <button className="cr-link" onClick={onOpenSettings}>Class settings</button> to step from lesson to lesson.
        </p>
      )}

      <input className="cr-plan__title" value={plan.title || ''} placeholder="Lesson title, e.g. Unit 5 – Past simple"
        onChange={(e) => setPlan((p) => ({ ...p, title: e.target.value }))} aria-label="Lesson title" />

      <div className={`cr-timebar ${left < 0 ? 'is-over' : left === 0 ? 'is-full' : ''}`}>
        <div className="cr-timebar__track" aria-hidden="true">
          {plan.items.map((it) => (
            <span key={it.id} style={{ flexGrow: Number(it.minutes) || 0, background: tagOf(it.tags?.[0])?.color || '#C9B8C6' }} title={`${it.aim || roleLabel(it) || 'Step'} – ${it.minutes} min`} />
          ))}
          {left > 0 && <span className="cr-timebar__free" style={{ flexGrow: left }} />}
        </div>
        <span className="cr-timebar__text">
          <b>{total}</b> / {length} min · {left > 0 ? `${left} min left` : left === 0 ? 'perfect fit ✓' : `${-left} min over!`}
        </span>
      </div>

      {error && <p className="cr-hint is-neg" role="alert">{error}</p>}
      {busy > 0 && <p className="cr-hint" role="status">Uploading… ({busy})</p>}

      <ol className="cr-prows">{head.map((it) => row(it))}</ol>
      <Reorder.Group as="ol" axis="y" values={middle} onReorder={reorderMiddle} className="cr-prows cr-prows--middle">
        {middle.map((it, i) => row(it, {
          draggable: true, index: i, count: middle.length,
          onMove: (dir) => moveMiddle(i, dir),
          onRemove: () => removeItem(it),
        }))}
      </Reorder.Group>
      <div className="cr-pcards__add">
        <button className="cr-btn cr-btn--primary" onClick={addItem}><Icon.plus />Add task</button>
      </div>
      <ol className="cr-prows">{tail.map((it) => row(it))}</ol>
    </Sheet>
  )
}

const ROLE_LABEL = { warmer: 'Warmer', hwreview: 'Homework review', homework: 'Future homework', reflection: 'Self-reflection' }
const roleLabel = (it) => ROLE_LABEL[it.role] || ''
const AIM_PLACEHOLDER = {
  warmer: 'Warmer – e.g. Quizlet game, picture talk',
  homework: 'Future homework – e.g. WB p3/5–6',
}

function PlanRow({ item, step, start, cls, review, open, onToggle, onChange, onFiles, draggable, index, count, onMove, onRemove }) {
  const controls = useDragControls()
  const fileRef = useRef(null)
  const [linkForm, setLinkForm] = useState(null)
  const [over, setOver] = useState(false)
  const role = item.role
  const locked = role === 'hwreview'
  const compactOnly = role === 'reflection' // csak cím + idő, nem nyitható
  const canFiles = !locked && !compactOnly
  const org = ORG_FORMS.find((o) => o.id === item.org)
  const reviewAim = locked ? (review ? review.items.map((h) => h.aim).filter(Boolean).join(' · ') || 'homework' : 'no homework set in the previous lesson') : null
  const toggleTag = (id) => onChange((it) => ({ tags: it.tags?.includes(id) ? it.tags.filter((t) => t !== id) : [...(it.tags || []), id] }))
  const addLink = (e) => {
    e.preventDefault()
    const url = normalizeUrl(linkForm.url)
    if (!url) return
    onChange((it) => ({ resources: [...(it.resources || []), { id: uid(), type: 'link', url, name: linkForm.name.trim() || hostOf(url) }] }))
    setLinkForm(null)
  }
  const removeRes = (r) => { removeFile(cls, r); onChange((it) => ({ resources: (it.resources || []).filter((x) => x.id !== r.id) })) }
  const shownTags = role ? [tagOf(role === 'warmer' ? 'warmer' : role === 'hwreview' ? 'hwreview' : role === 'homework' ? 'homework' : 'reflection')] : (item.tags || []).map(tagOf).filter(Boolean)

  const Wrap = draggable ? Reorder.Item : 'li'
  const wrapProps = draggable
    ? { as: 'li', value: item, dragListener: false, dragControls: controls, layout: 'position', transition: { layout: { duration: 0.14, ease: 'easeOut' } } }
    : {}

  return (
    <Wrap
      {...wrapProps}
      className={`cr-prow ${open ? 'is-open' : ''} ${role ? `is-fixed is-${role}` : ''} ${over ? 'is-over' : ''}`}
      onPaste={(e) => { const files = [...(e.clipboardData?.files || [])]; if (files.length && canFiles) { e.preventDefault(); onFiles(files) } }}
      onDragOver={(e) => { if (canFiles && e.dataTransfer?.types?.includes('Files')) { e.preventDefault(); setOver(true) } }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { if (canFiles && e.dataTransfer?.files?.length) { e.preventDefault(); setOver(false); onFiles([...e.dataTransfer.files]) } }}
    >
      <div className="cr-prow__line" onClick={(e) => { if (!compactOnly && !e.target.closest('input, button, select, textarea, a')) onToggle() }}>
        {draggable
          ? <button className="cr-pcard__grip" onPointerDown={(e) => controls.start(e)} aria-label="Drag to reorder" title="Drag to reorder">⠿</button>
          : <span className="cr-prow__pin" title="Fixed step" aria-hidden="true">📌</span>}
        <span className="cr-prow__step">{step}</span>
        <span className="cr-prow__time">
          <span className="cr-prow__min">
            <input type="number" min="1" max="45" value={item.minutes} onChange={(e) => onChange({ minutes: Math.max(0, Math.min(90, Number(e.target.value) || 0)) })} aria-label="Minutes" />
            <small>min</small>
          </span>
          {start && <small className="cr-prow__clock">{start}</small>}
        </span>
        <span className="cr-prow__aim">
          {shownTags.length > 0 && (
            <span className="cr-prow__tags">
              {shownTags.map((t) => <span key={t.id} className="cr-tag" style={{ '--tg': t.color }}>{t.label}</span>)}
            </span>
          )}
          {locked ? (
            <span className="cr-prow__locked" title={review ? `From ${lessonLabel(review.key)}` : ''}>🔒 {reviewAim}</span>
          ) : compactOnly ? (
            <span className="cr-prow__locked">Self-reflection</span>
          ) : (
            <input value={item.aim} placeholder={AIM_PLACEHOLDER[role] || 'Aim – what students will be able to do'} onChange={(e) => onChange({ aim: e.target.value })} aria-label="Aim" />
          )}
        </span>
        <span className="cr-prow__org" title={org?.label || ''}>{org && !compactOnly ? <>{org.icon}<small>{org.label}</small></> : null}</span>
        <span className="cr-prow__end">
          {item.resources?.length > 0 && <span className="cr-prow__count" title="Resources">📎{item.resources.length}</span>}
          {!compactOnly && (
            <button className="cr-iconbtn cr-iconbtn--sm cr-prow__toggle" onClick={onToggle} aria-expanded={open} aria-label={open ? 'Collapse' : 'Edit details'}>
              <Icon.next />
            </button>
          )}
        </span>
      </div>

      {open && locked && (
        <div className="cr-prow__details">
          <p className="cr-hint">🔒 Copied from the previous lesson's <b>Future homework</b>{review ? ` (${lessonLabel(review.key, { weekday: 'long', day: 'numeric', month: 'long' })})` : ''}. Edit it there.</p>
          {review?.items.map((h) => (
            <div key={h.id} className="cr-review">
              <b>{h.aim || 'Homework'}</b>
              {h.activity && <p><Linkify text={h.activity} /></p>}
              {h.equipment && <small>🎒 {h.equipment}</small>}
              {h.resources?.length > 0 && <div className="cr-pcard__res">{h.resources.map((r) => <Resource key={r.id} r={r} cls={cls} />)}</div>}
            </div>
          ))}
          <OrgPicker item={item} onChange={onChange} />
        </div>
      )}

      {open && !locked && !compactOnly && (
        <div className="cr-prow__details">
          <label className="cr-pfield">
            <span>{role === 'homework' ? 'Homework details' : 'Activity'}</span>
            <textarea rows={3} value={item.activity || ''} placeholder={role === 'homework' ? 'Exercises, pages, deadline…' : 'What happens: instructions, pages, exercises…'} onChange={(e) => onChange({ activity: e.target.value })} />
          </label>
          {role !== 'homework' && <OrgPicker item={item} onChange={onChange} />}
          {role !== 'homework' && (
            <label className="cr-pfield">
              <span>Equipment</span>
              <input value={item.equipment || ''} placeholder="e.g. Coursebook, worksheet, laptop + speakers" onChange={(e) => onChange({ equipment: e.target.value })} />
            </label>
          )}
          {!role && (
            <div className="cr-pfield">
              <span>Tags <small className="cr-muted">(choose any)</small></span>
              <div className="cr-pcard__skills">
                {TASK_TAGS.map((t) => (
                  <button key={t.id} className={`cr-sk ${item.tags?.includes(t.id) ? 'is-on' : ''}`} style={{ '--sk': t.color }} onClick={() => toggleTag(t.id)} aria-pressed={item.tags?.includes(t.id)}>{t.label}</button>
                ))}
              </div>
            </div>
          )}
          <div className="cr-pfield">
            <span>Resources</span>
            {item.resources?.length > 0 && <div className="cr-pcard__res">{item.resources.map((r) => <Resource key={r.id} r={r} cls={cls} onRemove={() => removeRes(r)} />)}</div>}
            {linkForm ? (
              <form className="cr-pcard__linkform" onSubmit={addLink}>
                <input value={linkForm.url} onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })} placeholder="https://… (LearningApps, Quizlet, YouTube, Drive…)" autoFocus aria-label="Link" />
                <input value={linkForm.name} onChange={(e) => setLinkForm({ ...linkForm, name: e.target.value })} placeholder="Name (optional)" aria-label="Link name" />
                <button type="submit" className="cr-btn cr-btn--primary cr-btn--sm" disabled={!normalizeUrl(linkForm.url)}>Add</button>
                <button type="button" className="cr-btn cr-btn--sm" onClick={() => setLinkForm(null)}>Cancel</button>
              </form>
            ) : (
              <div className="cr-pcard__addres">
                <button className="cr-btn cr-btn--sm" onClick={() => setLinkForm({ url: '', name: '' })}>🔗 Link</button>
                <button className="cr-btn cr-btn--sm" onClick={() => fileRef.current?.click()}>📎 File / image / audio</button>
                <input ref={fileRef} type="file" multiple hidden
                  accept="image/*,audio/*,video/mp4,video/webm,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.odt,.txt,.zip"
                  onChange={(e) => { const f = [...e.target.files]; e.target.value = ''; if (f.length) onFiles(f) }} />
              </div>
            )}
          </div>
          {draggable && (
            <div className="cr-prow__actions">
              <button className="cr-iconbtn cr-iconbtn--sm" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move up">↑</button>
              <button className="cr-iconbtn cr-iconbtn--sm" disabled={index === count - 1} onClick={() => onMove(1)} aria-label="Move down">↓</button>
              <span className="cr-spacer" />
              <button className="cr-btn cr-btn--danger cr-btn--sm" onClick={onRemove}><Icon.trash />Delete step</button>
            </div>
          )}
        </div>
      )}
    </Wrap>
  )
}

function OrgPicker({ item, onChange }) {
  return (
    <div className="cr-pfield">
      <span>Organisation form</span>
      <div className="cr-pcard__kinds" role="radiogroup" aria-label="Organisation form">
        {ORG_FORMS.map((o) => (
          <button key={o.id} role="radio" aria-checked={item.org === o.id} className={item.org === o.id ? 'is-active' : ''}
            onClick={() => onChange((it) => ({ org: it.org === o.id ? '' : o.id }))}>{o.icon} {o.label}</button>
        ))}
      </div>
    </div>
  )
}

// ── Osztálybeállítások: heti órarend, óra hossza ──
export function ClassSettings({ doc, update, onClose }) {
  const sched = [...(doc.schedule || [])].sort((a, b) => a.day - b.day || a.time.localeCompare(b.time))
  const set = (fn) => update((d) => ({ ...d, schedule: fn(d.schedule || []) }))
  const length = doc.lessonLength || LESSON_MIN
  return (
    <Sheet title="Class settings" onClose={onClose} className="cr-settings">
      <h3 className="cr-settings__h">Weekly timetable</h3>
      <p className="cr-hint">Your lessons with this class each week. The lesson planner uses these to step from lesson to lesson.</p>
      <ul className="cr-sched">
        {sched.map((s) => (
          <li key={s.id}>
            <select value={s.day} onChange={(e) => set((l) => l.map((x) => (x.id === s.id ? { ...x, day: Number(e.target.value) } : x)))} aria-label="Day">
              {WEEKDAYS.map((w) => <option key={w.id} value={w.id}>{w.label}</option>)}
            </select>
            <input type="time" value={s.time} step="300" onChange={(e) => e.target.value && set((l) => l.map((x) => (x.id === s.id ? { ...x, time: e.target.value } : x)))} aria-label="Start time" />
            <span className="cr-muted">– {addMinutes(s.time, length)}</span>
            <span className="cr-spacer" />
            <button className="cr-iconbtn cr-iconbtn--sm" onClick={() => set((l) => l.filter((x) => x.id !== s.id))} aria-label="Remove lesson"><Icon.close /></button>
          </li>
        ))}
      </ul>
      <button className="cr-btn" onClick={() => set((l) => [...l, { id: uid(), day: (sched[sched.length - 1]?.day % 5 || 0) + 1, time: sched[sched.length - 1]?.time || '08:00' }])}>
        <Icon.plus />Add weekly lesson
      </button>
      <h3 className="cr-settings__h">Lesson length</h3>
      <label className="cr-field cr-field--inline">
        <span>Minutes per lesson</span>
        <input type="number" min="20" max="120" step="5" value={length} onChange={(e) => update((d) => ({ ...d, lessonLength: Math.max(20, Math.min(120, Number(e.target.value) || LESSON_MIN)) }))} />
      </label>
    </Sheet>
  )
}

// ── Diákoknak: Padlet-szerű idővonal ──
export function PlanTimeline({ plan, cls, heading, startTime }) {
  let acc = 0
  return (
    <div className="cr-timeline">
      <div className="cr-timeline__head">
        <h3>{heading}</h3>
        {plan.title && <p>{plan.title}</p>}
      </div>
      <ol className="cr-timeline__track">
        {plan.items.map((it, i) => {
          const start = addMinutes(startTime, acc)
          acc += Number(it.minutes) || 0
          const org = ORG_FORMS.find((o) => o.id === it.org)
          const tags = (it.tags || []).map(tagOf).filter(Boolean)
          return (
            <li key={it.id} className={`cr-tcard ${it.done ? 'is-done' : ''}`} style={{ '--tg': tags[0]?.color || '#C9B8C6' }}>
              <span className="cr-tcard__kind">Step {i + 1} · {it.minutes} min{start ? ` · ${start}` : ''}{it.done && ' · done ✓'}</span>
              {tags.length > 0 && <span className="cr-tcard__skills">{tags.map((t) => <span key={t.id} className="cr-tag" style={{ '--tg': t.color }}>{t.label}</span>)}</span>}
              {it.aim && <b className="cr-tcard__title">{it.aim}</b>}
              {it.activity && <p className="cr-tcard__note"><Linkify text={it.activity} /></p>}
              {(org || it.equipment) && (
                <p className="cr-tcard__meta">
                  {org && <span>{org.icon} {org.label}</span>}
                  {it.equipment && <span>🎒 {it.equipment}</span>}
                </p>
              )}
              {it.resources?.length > 0 && <div className="cr-tcard__res">{it.resources.map((r) => <Resource key={r.id} r={r} cls={cls} />)}</div>}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
