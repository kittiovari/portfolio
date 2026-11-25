import { useEffect, useRef, useState } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import { Sheet, Icon } from './ui.jsx'
import { Art, SkillArt, fileArt, stepArt } from './art.jsx'
import { KretaSheet } from './kreta.jsx'
import { YearPanel, FilesPanel, AccessPanel } from './upkeep.jsx'
import {
  LESSON_MIN, ORG_FORMS, TAGS, WEEKDAYS, addMinutes, dayKey, getPlan, lessonLabel, lessonTimeline, newItem, nextLessonKey,
  splitKey, tagOf, uid, previousHomework, withSkeleton, TASK_TAGS, plannedKeys, stepSkills,
  BELLS, isShortDay, lessonStart, lessonLength, breakOn,
  moveToNext, undoMove, nextKeyAfter,
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

// A fájl a tárolóban marad (más óra vagy egy archivált tanév is hivatkozhat rá);
// a nem használt fájlokat a Class settings → Files panelen lehet törölni.
const removeFile = () => {}

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
    body = <div className="cr-res__audio"><span><Art name="headphones" className="cr-art cr-art--sm" />{r.name}</span><audio controls preload="none" src={url} /></div>
  } else if (r.type === 'file' && mime.startsWith('video/')) {
    body = <video className="cr-res__video" controls preload="none" src={url} />
  } else if (r.type === 'file') {
    body = (
      <a href={url} target="_blank" rel="noopener noreferrer" className="cr-res__chip">
        <Art name={fileArt(mime)} className="cr-art cr-art--sm" /><span className="cr-res__name">{r.name}</span>{r.size ? <small>{fmtSize(r.size)}</small> : null}
      </a>
    )
  } else {
    body = (
      <a href={url} target="_blank" rel="noopener noreferrer" className="cr-res__chip cr-res__chip--link">
        <Art name="link" className="cr-art cr-art--sm" /><span className="cr-res__name">{r.name || hostOf(url)}</span><small>{hostOf(url)}</small>
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
export function PlanEditor({ doc, update, cls, onClose, onBack, onOpenSettings, initialKey }) {
  const timeline = lessonTimeline(doc)
  const hasSchedule = (doc.schedule || []).length > 0
  const [key, setKey] = useState(() => initialKey || nextLessonKey(doc) || dayKey())
  const [open, setOpen] = useState(null)
  const [busy, setBusy] = useState(0)
  const [error, setError] = useState('')
  const plan = withSkeleton(getPlan(doc, key))
  const { date, time } = splitKey(key)
  const prevHw = previousHomework(doc, key)
  const length = lessonLength(doc, key)
  const start0 = lessonStart(doc, key)
  const short = time ? isShortDay(doc, date) : false
  const holiday = breakOn(doc, date)
  // az áthúzott (házi nélküli) Homework review nem számít bele az időbe
  const mins = (it) => (it.role === 'hwreview' && !prevHw ? 0 : Number(it.minutes) || 0)
  const total = plan.items.reduce((s, it) => s + mins(it), 0)
  const left = length - total
  const head = plan.items.filter((it) => it.role === 'attendance' || it.role === 'warmer' || it.role === 'hwreview')
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
  const upcoming = timeline.filter((k) => !nextKey || k >= nextKey) // az egész hátralévő tanév

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
    if (it.resources?.length && !window.confirm('Delete this step? (Its files stay in Class settings → Files.)')) return
    it.resources?.forEach((r) => removeFile(cls, r))
    setPlan((p) => ({ ...p, items: p.items.filter((x) => x.id !== it.id) }))
  }
  const reorderMiddle = (mid) => setPlan((p) => ({ ...p, items: [...p.items.filter((x) => x.role === 'attendance' || x.role === 'warmer' || x.role === 'hwreview'), ...mid, ...p.items.filter((x) => x.role === 'homework' || x.role === 'reflection')] }))
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
  plan.items.forEach((it) => { startOf[it.id] = addMinutes(start0, acc); acc += mins(it) })
  const stepNo = Object.fromEntries(plan.items.map((it, i) => [it.id, i + 1]))

  const row = (it, extra = {}) => (
    <PlanRow
      key={it.id} item={it} step={stepNo[it.id]} start={startOf[it.id]} cls={cls} doc={doc}
      maxMinutes={Math.max(0, length - (total - mins(it)))}
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
            <LessonPicker
              doc={doc} value={key} nextKey={nextKey}
              options={upcoming.includes(key) ? upcoming : [key, ...upcoming]}
              planned={(k) => Boolean(doc.plans?.[k])}
              onChange={(k) => { setKey(k); setOpen(null) }}
            />
          ) : (
            <label className="cr-plan__date">
              <span>{lessonLabel(key, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <input type="date" value={date} onChange={(e) => e.target.value && setKey(e.target.value)} aria-label="Date" />
            </label>
          )}
        </div>
        <button className="cr-iconbtn" onClick={() => step(1)} aria-label="Next lesson"><Icon.next /></button>
      </div>
      {(time || holiday) && (
        <div className="cr-plan__daybar">
          {holiday && <span className="cr-plan__holiday"><Art name="holiday" className="cr-art cr-art--sm" /> {holiday.name || 'Break'} – no school</span>}
          {time && (
            <button className={`cr-plan__short ${short ? 'is-on' : ''}`} aria-pressed={short}
              onClick={() => update((d) => ({ ...d, shortDays: short ? (d.shortDays || []).filter((x) => x !== date) : [...new Set([...(d.shortDays || []), date])] }))}>
              <span className="cr-plan__switch" aria-hidden="true" />Shortened day (35 min)
            </button>
          )}
        </div>
      )}
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
            <span key={it.id} style={{ flexGrow: mins(it), background: tagOf(it.tags?.[0])?.color || '#C9B8C6' }} title={`${it.aim || roleLabel(it) || 'Step'} – ${it.minutes} min`} />
          ))}
          {left > 0 && <span className="cr-timebar__free" style={{ flexGrow: left }} />}
        </div>
        <span className="cr-timebar__text">
          <b>{total}</b> / {length} min{left >= 0 ? ' · ' : ''}{left > 0 ? `${left} min left` : left === 0 ? 'perfect fit ✓' : null}
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

// Óraválasztó: egyedi gomb + lenyíló lista (a natív select helyett)
export function LessonPicker({ value, options, nextKey, planned, onChange, doc = null }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const esc = (e) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false) } }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc, true)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc, true) }
  }, [open])
  const label = (k) => lessonLabel(k, { weekday: 'long', day: 'numeric', month: 'long' }, doc)
  return (
    <div className="cr-lpick" ref={ref}>
      <button className="cr-lpick__btn" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open}>
        <span>{label(value)}</span>
        {value === nextKey && <small className="cr-lpick__badge">next</small>}
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5" /></svg>
      </button>
      {open && (
        <ul className="cr-lpick__list" role="listbox" aria-label="Lessons">
          {options.map((k, i) => (
            <li key={k}>
              {(i === 0 || k.slice(0, 7) !== options[i - 1].slice(0, 7)) && (
                <span className="cr-lpick__month">{new Date(`${k.slice(0, 7)}-01T12:00`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
              )}
              <button role="option" aria-selected={k === value} className={k === value ? 'is-active' : ''} onClick={() => { onChange(k); setOpen(false) }}>
                <span>{label(k)}</span>
                {k === nextKey && <small className="cr-lpick__badge">next</small>}
                {planned(k) && <small className="cr-lpick__done" title="Planned">✓</small>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const ROLE_LABEL = { attendance: 'Attendance', warmer: 'Warmer', hwreview: 'Homework review', homework: 'Future homework', reflection: 'Self-reflection & Overall evaluation' }
const roleLabel = (it) => ROLE_LABEL[it.role] || ''
const AIM_PLACEHOLDER = {
  warmer: 'Warmer – e.g. Quizlet game, picture talk',
  homework: 'Future homework – e.g. WB p3/5–6',
}

function PlanRow({ item, step, start, cls, doc, review, maxMinutes = 45, open, onToggle, onChange, onFiles, draggable, index, count, onMove, onRemove }) {
  const controls = useDragControls()
  const fileRef = useRef(null)
  const [linkForm, setLinkForm] = useState(null)
  const [over, setOver] = useState(false)
  const role = item.role
  const locked = role === 'hwreview'
  const struck = locked && !review // nem volt házi az előző órán: áthúzva
  const compactOnly = role === 'attendance' || struck // csak cím + idő, nem nyitható
  const canFiles = !locked && !compactOnly && role !== 'reflection'
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
  const shownTags = role === 'reflection' || role === 'attendance' || struck ? [] : role ? [tagOf(role === 'warmer' ? 'warmer' : role === 'hwreview' ? 'hwreview' : role === 'homework' ? 'homework' : 'reflection')] : (item.tags || []).map(tagOf).filter(Boolean)

  const Wrap = draggable ? Reorder.Item : 'li'
  const wrapProps = draggable
    ? { as: 'li', value: item, dragListener: false, dragControls: controls, layout: 'position', transition: { layout: { duration: 0.14, ease: 'easeOut' } } }
    : {}

  return (
    <Wrap
      {...wrapProps}
      className={`cr-prow ${open ? 'is-open' : ''} ${role ? `is-fixed is-${role}` : ''} ${struck ? 'is-struck' : ''} ${over ? 'is-over' : ''}`}
      onPaste={(e) => { const files = [...(e.clipboardData?.files || [])]; if (files.length && canFiles) { e.preventDefault(); onFiles(files) } }}
      onDragOver={(e) => { if (canFiles && e.dataTransfer?.types?.includes('Files')) { e.preventDefault(); setOver(true) } }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { if (canFiles && e.dataTransfer?.files?.length) { e.preventDefault(); setOver(false); onFiles([...e.dataTransfer.files]) } }}
    >
      <div className="cr-prow__line" onClick={(e) => { if (!compactOnly && !e.target.closest('input, button, select, textarea, a')) onToggle() }}>
        {draggable
          ? <button className="cr-pcard__grip" onPointerDown={(e) => controls.start(e)} aria-label="Drag to reorder" title="Drag to reorder">⠿</button>
          : <span className="cr-prow__pin" aria-hidden="true" />}
        <span className="cr-prow__step">{step}</span>
        <span className="cr-prow__time">
          <span className="cr-prow__min">
            <input type="number" min="0" max={maxMinutes} value={item.minutes}
              onChange={(e) => onChange({ minutes: Math.max(0, Math.min(maxMinutes, Math.round(Number(e.target.value) || 0))) })}
              title={`Max. ${maxMinutes} min (lesson length)`} aria-label="Minutes" />
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
            struck
              ? <span className="cr-prow__locked">Homework review</span>
              : <span className="cr-prow__locked" title={`From ${lessonLabel(review.key)}`}><Art name="lock" className="cr-art cr-art--xs" /> {reviewAim}</span>
          ) : compactOnly || role === 'reflection' ? (
            <span className="cr-prow__locked">{ROLE_LABEL[role]}</span>
          ) : (
            <input value={item.aim} placeholder="Title" onChange={(e) => onChange({ aim: e.target.value })} aria-label="Title" />
          )}
        </span>
        <span className="cr-prow__org" title={org?.label || ''}>{org && !compactOnly ? <><OrgIcon id={org.id} /><small>{org.label}</small></> : null}</span>
        <span className="cr-prow__end">
          {item.resources?.length > 0 && <span className="cr-prow__count" title="Resources"><Art name="clip" className="cr-art cr-art--xs" />{item.resources.length}</span>}
          {!compactOnly && (
            <button className="cr-iconbtn cr-iconbtn--sm cr-prow__toggle" onClick={onToggle} aria-expanded={open} aria-label={open ? 'Collapse' : 'Edit details'}>
              <Icon.next />
            </button>
          )}
        </span>
      </div>

      {open && locked && (
        <div className="cr-prow__details">
          <p className="cr-hint"><Art name="lock" className="cr-art cr-art--xs" /> Copied from the previous lesson's <b>Future homework</b>{review ? ` (${lessonLabel(review.key, { weekday: 'long', day: 'numeric', month: 'long' })})` : ''}. Edit it there.</p>
          {review?.items.map((h) => (
            <div key={h.id} className="cr-review">
              <b>{h.aim || 'Homework'}</b>
              {h.activity && <p><Linkify text={h.activity} /></p>}
              {h.equipment && <small><Art name="bag" className="cr-art cr-art--xs" /> {h.equipment}</small>}
              {h.resources?.length > 0 && <div className="cr-pcard__res">{h.resources.map((r) => <Resource key={r.id} r={r} cls={cls} />)}</div>}
            </div>
          ))}
          <OrgPicker item={item} onChange={onChange} />
        </div>
      )}

      {open && role === 'reflection' && (
        <div className="cr-prow__details">
          <RuleChips doc={doc} item={item} />
        </div>
      )}

      {open && !locked && !compactOnly && role !== 'reflection' && (
        <div className="cr-prow__details">
          {/* Leírás + források egy dobozban: szöveg, alatta az előnézetek, alul a csatolás */}
          {role !== 'homework' && <OrgPicker item={item} onChange={onChange} />}
          {role !== 'homework' && <RuleChips doc={doc} item={item} />}
          <div className={`cr-compose ${over ? 'is-over' : ''}`}>
            <textarea rows={3} value={item.activity || ''}
              placeholder={role === 'homework' ? 'Homework: exercises, pages, deadline…' : 'Activity: what happens, instructions, pages…'}
              onChange={(e) => onChange({ activity: e.target.value })} aria-label={role === 'homework' ? 'Homework details' : 'Activity'} />
            {item.resources?.length > 0 && (
              <div className="cr-compose__res">{item.resources.map((r) => <Resource key={r.id} r={r} cls={cls} onRemove={() => removeRes(r)} />)}</div>
            )}
            {linkForm ? (
              <form className="cr-compose__link" onSubmit={addLink}>
                <input value={linkForm.url} onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })} placeholder="Paste a link – LearningApps, Quizlet, YouTube, Drive…" autoFocus aria-label="Link" />
                <input value={linkForm.name} onChange={(e) => setLinkForm({ ...linkForm, name: e.target.value })} placeholder="Name (optional)" aria-label="Link name" />
                <button type="submit" className="cr-btn cr-btn--primary cr-btn--sm" disabled={!normalizeUrl(linkForm.url)}>Add</button>
                <button type="button" className="cr-btn cr-btn--sm" onClick={() => setLinkForm(null)}>Cancel</button>
              </form>
            ) : (
              <div className="cr-compose__bar">
                <button className="cr-compose__btn" onClick={() => setLinkForm({ url: '', name: '' })} title="Add a link"><Art name="link" className="cr-art cr-art--sm" />Link</button>
                <button className="cr-compose__btn" onClick={() => fileRef.current?.click()} title="Attach a file, image or audio – or drop / paste it here"><Art name="clip" className="cr-art cr-art--sm" />File</button>
                <input ref={fileRef} type="file" multiple hidden
                  accept="image/*,audio/*,video/mp4,video/webm,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.odt,.txt,.zip"
                  onChange={(e) => { const f = [...e.target.files]; e.target.value = ''; if (f.length) onFiles(f) }} />
              </div>
            )}
          </div>
          {role !== 'homework' && (
            <label className="cr-pfield">
              <input value={item.equipment || ''} placeholder="Equipment: coursebook, worksheet, speakers…" onChange={(e) => onChange({ equipment: e.target.value })} aria-label="Equipment" />
            </label>
          )}
          {!role && (
            <div className="cr-pfield">
              <div className="cr-pcard__skills">
                {TASK_TAGS.map((t) => (
                  <button key={t.id} className={`cr-sk ${item.tags?.includes(t.id) ? 'is-on' : ''}`} style={{ '--sk': t.color }} onClick={() => toggleTag(t.id)} aria-pressed={item.tags?.includes(t.id)}>{t.label}</button>
                ))}
              </div>
            </div>
          )}
          {draggable && (
            <div className="cr-prow__actions">
              <button className="cr-iconbtn cr-iconbtn--sm" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move up">↑</button>
              <button className="cr-iconbtn cr-iconbtn--sm" disabled={index === count - 1} onClick={() => onMove(1)} aria-label="Move down">↓</button>
              <span className="cr-spacer" />
              <button className="cr-btn cr-btn--danger cr-btn--sm" onClick={onRemove}><Icon.trash />Delete</button>
            </div>
          )}
        </div>
      )}
    </Wrap>
  )
}

// Munkaforma-ikonok: babszem-figurák az oldal illusztrációinak stílusában
const beanPath = (cx, base, w, h) => {
  const l = cx - w / 2, r = cx + w / 2, t = base - h
  return `M${l} ${base}C${l - 0.3} ${base - h * 0.6} ${l + w * 0.06} ${t + h * 0.12} ${cx} ${t}C${r - w * 0.06} ${t + h * 0.12} ${r + 0.3} ${base - h * 0.6} ${r} ${base}Z`
}
const Bean = ({ cx, base, w, h }) => {
  const ey = base - h * 0.6
  return (
    <g>
      <path d={beanPath(cx, base, w, h)} fill="var(--bean, #F3E3C8)" />
      <circle cx={cx - w * 0.17} cy={ey} r="1.15" fill="currentColor" stroke="none" />
      <circle cx={cx + w * 0.17} cy={ey} r="1.15" fill="currentColor" stroke="none" />
      <path d={`M${cx - w * 0.15} ${ey + h * 0.16}q${w * 0.15} ${h * 0.09} ${w * 0.3} 0`} strokeWidth="1.3" />
    </g>
  )
}
export function OrgIcon({ id, className = 'cr-orgicon' }) {
  const figures = {
    frontal: (
      <>
        <rect x="2.5" y="3" width="15" height="11" rx="1.5" fill="#fff" />
        <path d="M5.5 7h8M5.5 10.5h5.5" strokeWidth="1.3" opacity=".6" />
        <path d="M19.5 17.5L15 12" strokeWidth="1.5" />
        <Bean cx={27} base={29} w={13} h={22} />
      </>
    ),
    individual: <Bean cx={20} base={29} w={14} h={24} />,
    pairs: (<><Bean cx={13.5} base={29} w={12} h={21} /><Bean cx={26.5} base={29} w={12} h={23} /></>),
    groups: (<><Bean cx={9} base={29} w={10.5} h={17} /><Bean cx={20} base={29} w={11} h={21} /><Bean cx={31} base={29} w={10.5} h={17} /></>),
  }
  return (
    <svg className={className} viewBox="0 0 40 31" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {figures[id]}
    </svg>
  )
}

// A lépésnél adható pontok (a munkaforma szerint; a Class panelen módosíthatók)
function RuleChips({ doc, item }) {
  const list = stepSkills(doc, item)
  if (!list.length) return item.role ? null : <p className="cr-ruleline cr-ruleline--hint">Choose the organisation form first</p>
  return (
    <p className="cr-ruleline">
      {list.map((k) => <span key={k.id} className={`cr-rulechip ${k.value < 0 ? 'is-neg' : ''}`}><SkillArt skill={k} className="cr-art cr-art--xs" /> {k.name} <b>{k.value > 0 ? `+${k.value}` : k.value}</b></span>)}
    </p>
  )
}

function OrgPicker({ item, onChange }) {
  return (
    <div className="cr-pfield">
      <div className="cr-pcard__kinds" role="radiogroup" aria-label="Organisation form">
        {ORG_FORMS.map((o) => (
          <button key={o.id} role="radio" aria-checked={item.org === o.id} className={item.org === o.id ? 'is-active' : ''}
            onClick={() => onChange((it) => ({ org: it.org === o.id ? '' : o.id }))}><OrgIcon id={o.id} />{o.label}</button>
        ))}
      </div>
    </div>
  )
}

// ── Osztálybeállítások: heti órarend (csengetési rend alapján), rövidített napok, tanév rendje ──
const SCHOOL_DAYS = WEEKDAYS.filter((w) => w.id <= 5)
export function ClassSettings({ doc, update, onClose, className = '', cls, onReload, meta, onClassesChanged }) {
  const sched = doc.schedule || []
  const has = (day, p) => sched.some((s) => s.day === day && (s.period === p || (!Number.isInteger(s.period) && s.time === BELLS.normal[p][0])))
  const toggle = (day, p) => update((d) => {
    const list = d.schedule || []
    const match = (s) => s.day === day && (s.period === p || (!Number.isInteger(s.period) && s.time === BELLS.normal[p][0]))
    return { ...d, schedule: list.some(match) ? list.filter((s) => !match(s)) : [...list, { id: uid(), day, period: p }] }
  })
  const cal = doc.calendar || {}
  const setUnits = (fn) => update((d) => ({ ...d, units: fn(d.units || []) }))
  const setCal = (patch) => update((d) => ({ ...d, calendar: { ...(d.calendar || {}), ...(typeof patch === 'function' ? patch(d.calendar || {}) : patch) } }))
  const shortDays = [...(doc.shortDays || [])].sort()
  const [newShort, setNewShort] = useState('')
  const count = sched.length

  return (
    <Sheet title={`${className ? `${className} – ` : ''}Class settings`} onClose={onClose} wide className="cr-settings">
      <h3 className="cr-settings__h">Weekly timetable <small className="cr-muted">· {count} lesson{count === 1 ? '' : 's'} a week</small></h3>
      <div className="cr-ttable-wrap">
        <table className="cr-ttable">
          <thead>
            <tr><th /><th />{SCHOOL_DAYS.map((w) => <th key={w.id}>{w.short}</th>)}</tr>
          </thead>
          <tbody>
            {BELLS.normal.map(([from, to], p) => (
              <tr key={p}>
                <th className="cr-ttable__p">{p}.</th>
                <td className="cr-ttable__time">{from}–{to}</td>
                {SCHOOL_DAYS.map((w) => {
                  const on = has(w.id, p)
                  return (
                    <td key={w.id}>
                      <button className={`cr-ttable__cell ${on ? 'is-on' : ''}`} onClick={() => toggle(w.id, p)} aria-pressed={on}
                        aria-label={`${w.label}, period ${p} (${from})`}>{on ? '✓' : ''}</button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sched.filter((x) => !Number.isInteger(x.period) && !BELLS.normal.some(([t]) => t === x.time)).length > 0 && (
        <div className="cr-chiplist cr-chiplist--other">
          <span className="cr-muted">Other times:</span>
          {sched.filter((x) => !Number.isInteger(x.period) && !BELLS.normal.some(([t]) => t === x.time)).map((x) => (
            <span key={x.id} className="cr-chipx">
              {WEEKDAYS.find((w) => w.id === x.day)?.short} {x.time}
              <button className="cr-iconbtn cr-iconbtn--sm" aria-label="Remove" onClick={() => update((d) => ({ ...d, schedule: (d.schedule || []).filter((y) => y.id !== x.id) }))}><Icon.close /></button>
            </span>
          ))}
        </div>
      )}

      <h3 className="cr-settings__h">Shortened days <small className="cr-muted">· 35-minute lessons · shared by all classes</small></h3>
      <div className="cr-chiplist">
        {shortDays.map((d) => (
          <span key={d} className="cr-chipx">
            {lessonLabel(d, { weekday: 'short', day: 'numeric', month: 'short' })}
            <button className="cr-iconbtn cr-iconbtn--sm" aria-label="Remove" onClick={() => update((x) => ({ ...x, shortDays: (x.shortDays || []).filter((y) => y !== d) }))}><Icon.close /></button>
          </span>
        ))}
        <form className="cr-chiplist__add" onSubmit={(e) => { e.preventDefault(); if (newShort) { update((x) => ({ ...x, shortDays: [...new Set([...(x.shortDays || []), newShort])] })); setNewShort('') } }}>
          <input type="date" value={newShort} onChange={(e) => setNewShort(e.target.value)} aria-label="Shortened day" />
          <button className="cr-btn cr-btn--sm" type="submit" disabled={!newShort}><Icon.plus />Add</button>
        </form>
      </div>

      <h3 className="cr-settings__h">School year <span className="cr-muted">· shared by all classes</span></h3>
      <div className="cr-year">
        <label className="cr-year__f"><span>First day</span><input type="date" value={cal.start || ''} onChange={(e) => setCal({ start: e.target.value })} /></label>
        <label className="cr-year__f"><span>Last day</span><input type="date" value={cal.end || ''} onChange={(e) => setCal({ end: e.target.value })} /></label>
      </div>
      <ul className="cr-breaks">
        {(cal.breaks || []).map((b) => (
          <li key={b.id}>
            <input value={b.name} placeholder="Break, e.g. Winter break" onChange={(e) => setCal((c) => ({ breaks: c.breaks.map((x) => (x.id === b.id ? { ...x, name: e.target.value } : x)) }))} aria-label="Break name" />
            <input type="date" value={b.from || ''} onChange={(e) => setCal((c) => ({ breaks: c.breaks.map((x) => (x.id === b.id ? { ...x, from: e.target.value, to: x.to && x.to >= e.target.value ? x.to : e.target.value } : x)) }))} aria-label="From" />
            <span className="cr-muted">–</span>
            <input type="date" value={b.to || ''} min={b.from || undefined} onChange={(e) => setCal((c) => ({ breaks: c.breaks.map((x) => (x.id === b.id ? { ...x, to: e.target.value } : x)) }))} aria-label="To" />
            <button className="cr-iconbtn cr-iconbtn--sm" aria-label="Remove break" onClick={() => setCal((c) => ({ breaks: c.breaks.filter((x) => x.id !== b.id) }))}><Icon.close /></button>
          </li>
        ))}
      </ul>
      <button className="cr-btn cr-btn--sm" onClick={() => setCal((c) => ({ breaks: [...(c.breaks || []), { id: uid(), name: '', from: '', to: '' }] }))}>
        <Icon.plus />Add break / day off
      </button>

      <h3 className="cr-settings__h">Units</h3>
      <ul className="cr-breaks">
        {[...(doc.units || [])].sort((a, b) => ((a.from || '9') < (b.from || '9') ? -1 : 1)).map((u) => (
          <li key={u.id}>
            <input value={u.name} placeholder="Unit name, e.g. Unit 3 – Food" onChange={(e) => setUnits((l) => l.map((x) => (x.id === u.id ? { ...x, name: e.target.value } : x)))} aria-label="Unit name" />
            <input type="date" value={u.from || ''} onChange={(e) => setUnits((l) => l.map((x) => (x.id === u.id ? { ...x, from: e.target.value, to: x.to && x.to >= e.target.value ? x.to : e.target.value } : x)))} aria-label="Start" />
            <span className="cr-muted">–</span>
            <input type="date" value={u.to || ''} min={u.from || undefined} onChange={(e) => setUnits((l) => l.map((x) => (x.id === u.id ? { ...x, to: e.target.value } : x)))} aria-label="End" />
            <button className="cr-iconbtn cr-iconbtn--sm" aria-label="Remove unit" onClick={() => setUnits((l) => l.filter((x) => x.id !== u.id))}><Icon.close /></button>
          </li>
        ))}
      </ul>
      <button className="cr-btn cr-btn--sm" onClick={() => setUnits((l) => [...l, { id: uid(), name: '', from: '', to: '' }])}>
        <Icon.plus />Add unit
      </button>

      <AccessPanel cls={cls} meta={meta} onChanged={onClassesChanged} />
      <YearPanel doc={doc} cls={cls} onReload={() => { onClose(); onReload?.() }} />
      <FilesPanel doc={doc} cls={cls} />
    </Sheet>
  )
}

// ── Diákoknak: Padlet-szerű idővonal ──
export function PlanTimeline({ plan, cls, heading, startTime }) {
  let acc = 0
  return (
    <div className="cr-timeline">
      <div className="cr-timeline__head">
        <h3><CalendarArt className="cr-art cr-art--lg" />{heading}</h3>
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
              <span className="cr-tcard__badge"><Art name={stepArt(it)} className="cr-art" /></span>
              <span className="cr-tcard__kind">Step {i + 1} · {it.minutes} min{start ? ` · ${start}` : ''}{it.done && ' · done ✓'}</span>
              {tags.length > 0 && <span className="cr-tcard__skills">{tags.map((t) => <span key={t.id} className="cr-tag" style={{ '--tg': t.color }}>{t.label}</span>)}</span>}
              {it.aim && <b className="cr-tcard__title">{it.aim}</b>}
              {it.activity && <p className="cr-tcard__note"><Linkify text={it.activity} /></p>}
              {it.resources?.length > 0 && <div className="cr-tcard__res">{it.resources.map((r) => <Resource key={r.id} r={r} cls={cls} />)}</div>}
              {(org || it.equipment) && (
                <p className="cr-tcard__meta">
                  {org && <span className="cr-tcard__org"><OrgIcon id={org.id} />{org.label}</span>}
                  {it.equipment && <span><Art name="bag" className="cr-art cr-art--xs" /> {it.equipment}</span>}
                </p>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

// Vonalrajzos naptár az oldal illusztrációinak stílusában (spirál, kiemelt nap)
export function CalendarArt({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" stroke="#241422" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="8" width="30" height="27" rx="5" fill="#FBF4DC" />
      <path d="M5 16h30" />
      <path d="M12 5v6M20 5v6M28 5v6" />
      <g fill="#241422" stroke="none" opacity=".55">
        <circle cx="12" cy="22" r="1.3" /><circle cx="20" cy="22" r="1.3" />
        <circle cx="12" cy="29" r="1.3" /><circle cx="20" cy="29" r="1.3" /><circle cx="28" cy="29" r="1.3" />
      </g>
      <circle cx="28" cy="22" r="3.6" fill="#E0B33A" />
    </svg>
  )
}

// Jelenlét összesítése egy napra
function attSummary(doc, date) {
  const a = doc.attendance?.[date]
  if (!a || !Object.keys(a).length) return 'Not taken yet'
  const v = Object.values(a)
  const n = (st) => v.filter((x) => x === st).length
  const late = n('late'), left = n('left')
  return `${n('present')} here · ${n('absent')} absent${late ? ` · ${late} late` : ''}${left ? ` · ${left} left early` : ''}`
}

// ── Tanári osztálynézet: az óra idővonala, feladathoz kötött pontozással ──
// Választható órák: a már megtartott (betervezett) órák, az éppen aktuális óra,
// és a következő, már előkészített órák.
export function LessonBoard({ doc, update, cls, active, onSelect, onEdit, onCheckHomework, onTakeAttendance, onMakeGroups, onGivePoints }) {
  const today = dayKey()
  const nowKey = nextLessonKey(doc)
  const planned = plannedKeys(doc)
  const current = nowKey && splitKey(nowKey).date === today ? nowKey : null
  const options = [...new Set([...planned, ...(current ? [current] : [])])].sort()
  const initial = current || planned.find((k) => !nowKey || k >= nowKey) || planned[planned.length - 1] || nowKey
  const [key, setKey] = useState(initial)
  const [kreta, setKreta] = useState(false)
  const [undo, setUndo] = useState(null) // { key, itemId, title, to } – az imént áttolt feladat
  const undoTimer = useRef(null)
  const showUndo = (u) => { clearTimeout(undoTimer.current); setUndo(u); undoTimer.current = setTimeout(() => setUndo(null), 10000) }
  const track = useRef(null)

  const plan = key ? withSkeleton(getPlan(doc, key)) : { title: '', items: [] }
  const isPlanned = key && planned.includes(key)
  const prevHw = key ? previousHomework(doc, key) : null
  const items = plan.items.filter((it) => !(it.role === 'hwreview' && !prevHw))
  const { time } = key ? splitKey(key) : {}

  // a kijelölt feladat középre csúszik
  useEffect(() => {
    if (!active?.itemId) return
    track.current?.querySelector(`[data-step="${active.itemId}"]`)?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [active?.itemId])

  const changeLesson = (k) => { setKey(k); onSelect(null) }
  const setOrg = (itemId, org) => update((d) => {
    const p = withSkeleton(getPlan(d, key))
    return { ...d, plans: { ...(d.plans || {}), [key]: { ...p, items: p.items.map((x) => (x.id === itemId ? { ...x, org: x.org === org ? '' : org } : x)) } } }
  })
  let acc = 0

  return (
    <section className="cr-lboard" aria-label="Lesson timeline">
      <div className="cr-lboard__head">
        <CalendarArt className="cr-lboard__icon" />
        {options.length > 0 && key ? (
          <LessonPicker doc={doc} value={key} options={options.includes(key) ? options : [key, ...options]} nextKey={nowKey} planned={(k) => planned.includes(k)} onChange={changeLesson} />
        ) : (
          <b className="cr-lboard__none">No lessons yet</b>
        )}
        <button className="cr-btn cr-btn--sm" onClick={() => onEdit(key)}><Icon.pencil />{isPlanned ? 'Edit plan' : 'Plan this lesson'}</button>
        {isPlanned && <button className="cr-btn cr-btn--sm" onClick={() => setKreta(true)} title="Copy for E-Kréta, download files"><Icon.download />E-Kréta</button>}
      </div>
      {kreta && key && <KretaSheet doc={doc} cls={cls} lessonKey={key} onClose={() => setKreta(false)} />}
      {undo && (
        <div className="cr-undo" role="status">
          <span>Moved to {lessonLabel(undo.to, undefined, doc)}: <b>{undo.title}</b></span>
          <button className="cr-btn cr-btn--sm cr-btn--primary" onClick={() => { update((d) => undoMove(d, undo.key, undo.itemId)); setUndo(null) }}>Undo</button>
        </div>
      )}
      {plan.title && <p className="cr-lboard__title">{plan.title}</p>}

      {isPlanned ? (
        <>
          <ol className="cr-timeline__track cr-lboard__track" ref={track}>
            {items.map((it, i) => {
              const start = addMinutes(lessonStart(doc, key), acc)
              acc += (it.role === 'hwreview' && !prevHw) || it.moved ? 0 : Number(it.minutes) || 0
              const title = it.role === 'hwreview'
                ? `Homework review: ${prevHw.items.map((h) => h.aim).filter(Boolean).join(' · ') || 'homework'}`
                : it.aim || ROLE_LABEL[it.role] || `Task ${i + 1}`
              const tags = (it.role ? [tagOf(it.role === 'reflection' ? 'reflection' : it.role)] : (it.tags || []).map(tagOf)).filter(Boolean)
              const org = ORG_FORMS.find((o) => o.id === it.org)
              const evs = doc.events.filter((e) => e.l === key && e.st === it.id)
              const sum = evs.reduce((s, e) => s + e.v, 0)
              const kids = new Set(evs.map((e) => e.s)).size
              const sel = active?.key === key && active?.itemId === it.id
              return (
                <li key={it.id} data-step={it.id} className={`cr-tcard cr-lcard ${sel ? 'is-selected' : ''} ${it.moved ? 'is-moved' : ''}`} style={{ '--tg': tags[0]?.color || '#C9B8C6' }}>
                  <button className="cr-lcard__btn" onClick={() => { if (it.role !== 'homework') onSelect(sel ? null : { key, itemId: it.id, title, role: it.role || null }) }} aria-pressed={sel}>
                    <span className="cr-tcard__badge"><Art name={stepArt(it)} className="cr-art" /></span>
                    <span className="cr-tcard__kind">{i + 1} · {it.minutes} min{start ? ` · ${start}` : ''}</span>
                    {tags.length > 0 && <span className="cr-tcard__skills">{tags.map((t) => <span key={t.id} className="cr-tag" style={{ '--tg': t.color }}>{t.label}</span>)}</span>}
                    <b className="cr-tcard__title">{title}</b>
                    {it.from && <small className="cr-lcard__from">↪ from {lessonLabel(it.from, undefined, doc)}</small>}
                    {it.role !== 'homework' && <span className={`cr-lcard__pts ${evs.length ? 'has' : ''}`}>
                      {it.role === 'attendance' ? attSummary(doc, splitKey(key).date)
                        : evs.length ? `${sum > 0 ? '+' : ''}${sum} pts · ${kids} student${kids === 1 ? '' : 's'}` : sel ? 'Give points above ↑' : 'No points yet'}
                    </span>}
                  </button>
                  {/* részletek: leírás és feltöltött tartalmak (olvasható, lejátszható, megnyitható) */}
                  {(() => {
                    const src = it.role === 'hwreview' ? prevHw.items : [it]
                    const text = src.map((x) => x.activity).filter(Boolean).join('\n')
                    const res = src.flatMap((x) => x.resources || [])
                    const eq = src.map((x) => x.equipment).filter(Boolean).join(', ')
                    if (!text && !res.length && !eq) return null
                    return (
                      <div className="cr-lcard__detail">
                        {text && <p className="cr-tcard__note"><Linkify text={text} /></p>}
                        {res.length > 0 && <div className="cr-tcard__res">{res.map((r) => <Resource key={r.id} r={r} cls={cls} />)}</div>}
                        {eq && <p className="cr-tcard__meta"><span><Art name="bag" className="cr-art cr-art--xs" /> {eq}</span></p>}
                      </div>
                    )
                  })()}
                  {/* nem maradt rá idő → a következő órára (visszavonható) */}
                  {it.moved ? (
                    <p className="cr-lcard__moved">→ Moved to {lessonLabel(it.moved, undefined, doc)} <button className="cr-link" onClick={() => { if (sel) onSelect(null); update((d) => undoMove(d, key, it.id)) }}>Undo</button></p>
                  ) : !it.role && nextKeyAfter(doc, key) && (
                    <button className="cr-link cr-lcard__next" title="No time left? Move this task to the next lesson" onClick={() => { if (sel) onSelect(null); update((d) => moveToNext(d, key, it.id)); showUndo({ key, itemId: it.id, title, to: nextKeyAfter(doc, key) }) }}>
                      → Next lesson
                    </button>
                  )}
                  {/* munkaforma – óra közben is átállítható */}
                  {!it.moved && it.role !== 'attendance' && it.role !== 'reflection' && it.role !== 'homework' && (
                    <div className="cr-lcard__org" role="radiogroup" aria-label="Organisation form">
                      {ORG_FORMS.map((o) => (
                        <button key={o.id} role="radio" aria-checked={it.org === o.id} title={o.label}
                          className={it.org === o.id ? 'is-on' : ''} onClick={() => setOrg(it.id, o.id)}>
                          <OrgIcon id={o.id} />{it.org === o.id && <span>{o.label}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                  {!it.moved && (it.org === 'pairs' || it.org === 'groups') && it.role !== 'attendance' && (
                    <button className="cr-btn cr-btn--sm cr-lcard__action cr-lcard__action--light" onClick={() => {
                      onSelect({ key, itemId: it.id, title, role: it.role || null })
                      onMakeGroups(it.org === 'pairs' ? 2 : null, splitKey(key).date)
                    }}>
                      ✦ {it.org === 'pairs' ? 'Make pairs' : 'Make groups'}
                    </button>
                  )}
                  {/* pontadás ehhez a lépéshez */}
                  {!it.moved && stepSkills(doc, it).length > 0 && (
                    <button className="cr-btn cr-btn--primary cr-btn--sm cr-lcard__action" onClick={() => {
                      const step = { key, itemId: it.id, title, role: it.role || null }
                      onSelect(step)
                      onGivePoints(step)
                    }}>✓ Give points</button>
                  )}
                  {/* a jelenlét és a házi-ellenőrzés gombja magán a kártyán */}
                  {(it.role === 'attendance' || it.role === 'hwreview') && (
                    <button className="cr-btn cr-btn--primary cr-btn--sm cr-lcard__action" onClick={() => {
                      onSelect({ key, itemId: it.id, title, role: it.role })
                      if (it.role === 'attendance') onTakeAttendance(splitKey(key).date, key, it.id)
                      else onCheckHomework()
                    }}>
                      ✓ {it.role === 'attendance' ? 'Take attendance' : 'Check homework'}
                    </button>
                  )}
                </li>
              )
            })}
          </ol>
        </>
      ) : (
        <p className="cr-hint cr-hint--center">{key ? 'This lesson has no plan yet.' : 'Add your timetable in Class settings, then plan your first lesson.'}</p>
      )}
      {/* Új óraterv: a következő, még be nem tervezett órához */}
      <button className="cr-btn cr-btn--primary cr-btn--sm cr-lboard__new" onClick={() => {
        const from = nowKey || today
        const free = lessonTimeline(doc).find((k) => k >= from && !planned.includes(k))
        onEdit(free || nowKey || today)
      }}>
        <Icon.plus />New lesson plan
      </button>
    </section>
  )
}
