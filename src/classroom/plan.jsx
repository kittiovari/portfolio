import { useRef, useState } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import { Sheet, Icon } from './ui.jsx'
import { KINDS, SKILLS, EXTRA_TAGS, dayKey, getPlan, plannedDays, skillCoverage, uid } from './model.js'

/*
  Óraterv – osztályonként, naponként (előre több alkalomra is).
  Kártyák (bemelegítés / feladat / házi feladat) skill-címkékkel és
  forrásokkal: link, kép/képernyőkép, hangfájl, dokumentum.
  A fájlok titkosítva a szerverre kerülnek (/api/classfile), és csak az
  osztály jelszavával vagy tanárként érhetők el.
*/

// ── Dátum-segédek ──
const parseDay = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d) }
const shiftDay = (k, n) => { const d = parseDay(k); d.setDate(d.getDate() + n); return dayKey(d) }
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
export function PlanEditor({ doc, update, cls, onClose, onBack }) {
  const todayKey = dayKey()
  const [key, setKey] = useState(todayKey)
  const [busy, setBusy] = useState(0)
  const [error, setError] = useState('')
  const plan = getPlan(doc, key)
  const coverage = skillCoverage(plan)
  const missing = coverage.filter((s) => !s.ok)
  const days = plannedDays(doc).filter((k) => k >= todayKey)
  const rel = key === todayKey ? 'Today' : key === shiftDay(todayKey, 1) ? 'Tomorrow' : key === shiftDay(todayKey, -1) ? 'Yesterday' : null

  const setPlan = (fn) => update((d) => {
    const next = fn(getPlan(d, key))
    const plans = { ...(d.plans || {}) }
    if (next.items.length || next.title) plans[key] = next
    else delete plans[key]
    const today = { ...(d.today || {}) }
    delete today[key] // a régi napirend átkerült az óratervbe
    return { ...d, plans, today }
  })
  // patch lehet objektum vagy függvény (a legfrissebb kártyából számol – gyors kattintásoknál is pontos)
  const setItem = (id, patch) => setPlan((p) => ({ ...p, items: p.items.map((it) => (it.id === id ? { ...it, ...(typeof patch === 'function' ? patch(it) : patch) } : it)) }))
  const addItem = (kind = 'task') => setPlan((p) => ({ ...p, items: [...p.items, { id: uid(), kind, title: '', note: '', skills: [], resources: [], done: false }] }))
  const removeItem = (it) => {
    if (it.resources?.length && !window.confirm('This card and its uploaded files will be deleted. Are you sure?')) return
    it.resources?.forEach((r) => removeFile(cls, r))
    setPlan((p) => ({ ...p, items: p.items.filter((x) => x.id !== it.id) }))
  }
  const addFiles = async (itemId, files) => {
    setError('')
    for (const f of files) {
      setBusy((n) => n + 1)
      try {
        const r = await uploadFile(cls, f)
        setPlan((p) => ({ ...p, items: p.items.map((it) => (it.id === itemId ? { ...it, resources: [...(it.resources || []), r] } : it)) }))
      } catch (e) {
        setError(e.message)
      } finally {
        setBusy((n) => n - 1)
      }
    }
  }

  return (
    <Sheet title="Lesson plan" color="#E0B33A" icon={<Icon.sun />} onClose={onClose} onBack={onBack} wide className="cr-sheet--darktext cr-plan cr-plan--xl">
      <div className="cr-plan__nav">
        <button className="cr-iconbtn" onClick={() => setKey(shiftDay(key, -1))} aria-label="Previous day"><Icon.back /></button>
        <label className="cr-plan__date">
          <span>{rel && <b>{rel} · </b>}{dayLabel(key)}</span>
          <input type="date" value={key} onChange={(e) => e.target.value && setKey(e.target.value)} aria-label="Choose date" />
        </label>
        <button className="cr-iconbtn" onClick={() => setKey(shiftDay(key, 1))} aria-label="Next day"><Icon.next /></button>
      </div>
      <div className="cr-plan__days">
        {key !== todayKey && <button className="cr-plan__chip" onClick={() => setKey(todayKey)}>↩ Today</button>}
        {days.map((k) => (
          <button key={k} className={`cr-plan__chip ${k === key ? 'is-active' : ''}`} onClick={() => setKey(k)}>
            {k === todayKey ? 'Today' : dayLabel(k, { month: 'short', day: 'numeric', weekday: 'short' })}
            <small>{getPlan(doc, k).items.length}</small>
          </button>
        ))}
      </div>

      <input className="cr-plan__title" value={plan.title || ''} placeholder="Lesson title, e.g. Lesson 4 – Past simple"
        onChange={(e) => setPlan((p) => ({ ...p, title: e.target.value }))} aria-label="Lesson title" />

      {/* 4 skill: a házi feladattal együtt mindegyik szerepeljen */}
      <div className={`cr-skillbar ${missing.length ? '' : 'is-complete'}`}>
        {coverage.map((s) => (
          <span key={s.id} className={`cr-skillbar__item ${s.ok ? 'is-ok' : ''}`} style={{ '--sk': s.color }} title={s.label}>
            {s.ok ? '✓' : '○'} {s.label}
          </span>
        ))}
        <span className="cr-skillbar__msg">
          {!plan.items.length ? 'Add some tasks' : missing.length
            ? `Missing: ${missing.map((s) => s.label).join(', ')} – you could add it to the homework`
            : 'All 4 skills covered 🎉'}
        </span>
      </div>

      {error && <p className="cr-hint is-neg" role="alert">{error}</p>}
      {busy > 0 && <p className="cr-hint" role="status">Uploading… ({busy})</p>}

      <Reorder.Group as="ol" axis="y" values={plan.items} onReorder={(items) => setPlan((p) => ({ ...p, items }))} className="cr-pcards">
        {plan.items.map((it, i) => (
          <PlanCard
            key={it.id} item={it} index={i} count={plan.items.length} cls={cls}
            onChange={(patch) => setItem(it.id, patch)}
            onRemove={() => removeItem(it)}
            onMove={(dir) => setPlan((p) => { const a = [...p.items]; [a[i + dir], a[i]] = [a[i], a[i + dir]]; return { ...p, items: a } })}
            onFiles={(files) => addFiles(it.id, files)}
          />
        ))}
      </Reorder.Group>

      <div className="cr-pcards__add">
        {KINDS.map((k) => (
          <button key={k.id} className="cr-btn" onClick={() => addItem(k.id)}><span aria-hidden="true">{k.icon}</span>+ {k.label}</button>
        ))}
      </div>
      <p className="cr-hint cr-plan__note">To add a resource: use the “Link” / “File” button on a card, drag a file onto it, or paste a screenshot (Ctrl+V). On the class page students see today’s plan, or the next one if there’s none for today.</p>
    </Sheet>
  )
}

function PlanCard({ item, index, count, cls, onChange, onRemove, onMove, onFiles }) {
  const controls = useDragControls()
  const fileRef = useRef(null)
  const [linkForm, setLinkForm] = useState(null) // { url, name }
  const [over, setOver] = useState(false)
  const kind = KINDS.find((k) => k.id === item.kind) || KINDS[1]
  const toggleSkill = (id) => onChange((it) => ({ skills: it.skills?.includes(id) ? it.skills.filter((s) => s !== id) : [...(it.skills || []), id] }))

  const addLink = (e) => {
    e.preventDefault()
    const url = normalizeUrl(linkForm.url)
    if (!url) return
    onChange((it) => ({ resources: [...(it.resources || []), { id: uid(), type: 'link', url, name: linkForm.name.trim() || hostOf(url) }] }))
    setLinkForm(null)
  }
  const removeRes = (r) => {
    removeFile(cls, r)
    onChange((it) => ({ resources: (it.resources || []).filter((x) => x.id !== r.id) }))
  }

  return (
    <Reorder.Item
      value={item} dragListener={false} dragControls={controls}
      className={`cr-pcard cr-pcard--${item.kind} ${item.done ? 'is-done' : ''} ${over ? 'is-over' : ''}`}
      onPaste={(e) => {
        const files = [...(e.clipboardData?.files || [])]
        if (files.length) { e.preventDefault(); onFiles(files) }
      }}
      onDragOver={(e) => { if (e.dataTransfer?.types?.includes('Files')) { e.preventDefault(); setOver(true) } }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { if (e.dataTransfer?.files?.length) { e.preventDefault(); setOver(false); onFiles([...e.dataTransfer.files]) } }}
    >
      <div className="cr-pcard__side">
        <button className="cr-pcard__grip" onPointerDown={(e) => controls.start(e)} aria-label="Drag to move" title="Drag to reorder">⠿</button>
        <span className="cr-pcard__num">{index + 1}</span>
        <button className="cr-iconbtn cr-iconbtn--sm" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move up">↑</button>
        <button className="cr-iconbtn cr-iconbtn--sm" disabled={index === count - 1} onClick={() => onMove(1)} aria-label="Move down">↓</button>
      </div>

      <div className="cr-pcard__main">
        <div className="cr-pcard__top">
          <div className="cr-pcard__kinds" role="radiogroup" aria-label="Type">
            {KINDS.map((k) => (
              <button key={k.id} role="radio" aria-checked={item.kind === k.id} className={item.kind === k.id ? 'is-active' : ''} onClick={() => onChange({ kind: k.id })}>
                <span aria-hidden="true">{k.icon}</span> {k.label}
              </button>
            ))}
          </div>
          <span className="cr-spacer" />
          <label className="cr-pcard__done" title="Tick it off during the lesson">
            <input type="checkbox" checked={Boolean(item.done)} onChange={(e) => onChange({ done: e.target.checked })} /> done
          </label>
          <button className="cr-iconbtn cr-iconbtn--sm" onClick={onRemove} aria-label="Delete card"><Icon.trash /></button>
        </div>

        <input className="cr-pcard__title" value={item.title} placeholder={`${kind.label}: e.g. ${item.kind === 'homework' ? 'WB p3/5–6' : item.kind === 'warmup' ? 'Quizlet quiz' : 'Coursebook p5/1 – Listening'}`}
          onChange={(e) => onChange({ title: e.target.value })} aria-label="Title" />
        <textarea className="cr-pcard__note" rows={2} value={item.note || ''} placeholder="Description, page numbers, instructions… (optional)"
          onChange={(e) => onChange({ note: e.target.value })} aria-label="Description" />

        <div className="cr-pcard__skills">
          {[...SKILLS, ...EXTRA_TAGS].map((s) => (
            <button key={s.id} className={`cr-sk ${item.skills?.includes(s.id) ? 'is-on' : ''} ${s.color ? '' : 'cr-sk--extra'}`} style={{ '--sk': s.color || '#8A7888' }}
              onClick={() => toggleSkill(s.id)} aria-pressed={item.skills?.includes(s.id)}>{s.label}</button>
          ))}
        </div>

        {item.resources?.length > 0 && (
          <div className="cr-pcard__res">
            {item.resources.map((r) => <Resource key={r.id} r={r} cls={cls} onRemove={() => removeRes(r)} />)}
          </div>
        )}

        {linkForm ? (
          <form className="cr-pcard__linkform" onSubmit={addLink}>
            <input value={linkForm.url} onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })} placeholder="https://… (learningapps, Quizlet, YouTube, Drive…)" autoFocus aria-label="Link" />
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
    </Reorder.Item>
  )
}

// ── Diákoknak: Padlet-szerű idővonal ──
export function PlanTimeline({ plan, cls, heading }) {
  return (
    <div className="cr-timeline">
      <div className="cr-timeline__head">
        <h3>{heading}</h3>
        {plan.title && <p>{plan.title}</p>}
      </div>
      <ol className="cr-timeline__track">
        {plan.items.map((it, i) => {
          const kind = KINDS.find((k) => k.id === it.kind) || KINDS[1]
          return (
            <li key={it.id} className={`cr-tcard cr-tcard--${it.kind} ${it.done ? 'is-done' : ''}`}>
              <span className="cr-tcard__kind"><span aria-hidden="true">{kind.icon}</span> {kind.label}{it.done && ' · done ✓'}</span>
              {it.title && <b className="cr-tcard__title">{i + 1}. {it.title}</b>}
              {it.note && <p className="cr-tcard__note"><Linkify text={it.note} /></p>}
              {it.skills?.length > 0 && (
                <span className="cr-tcard__skills">
                  {[...SKILLS, ...EXTRA_TAGS].filter((s) => it.skills.includes(s.id)).map((s) => (
                    <span key={s.id} className="cr-sk is-on" style={{ '--sk': s.color || '#8A7888' }}>{s.label}</span>
                  ))}
                </span>
              )}
              {it.resources?.length > 0 && <div className="cr-tcard__res">{it.resources.map((r) => <Resource key={r.id} r={r} cls={cls} />)}</div>}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
