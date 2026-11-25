import { useEffect, useMemo, useState } from 'react'
import { Icon, Sheet } from './ui.jsx'
import { Art, fileArt } from './art.jsx'
import { download, CLASSES } from './model.js'

/*
  Fenntarthatóság: tanévek archívuma, biztonsági mentés, tárhely (fájlok).
  Szemlélet: minél több adat marad meg, annál teljesebb a kép egy-egy diákról –
  ezért semmi nem törlődik magától; a lezárt tanév archívumba kerül, a diákok
  azonosítója és kódja megmarad, így a riportok tanéveken átívelnek.
*/

// Az archivált tanévek dokumentumai (lustán, egyszer töltjük be)
const cache = new Map()
export function useArchives(cls, years = []) {
  const [docs, setDocs] = useState({})
  const key = `${cls}|${years.join(',')}`
  useEffect(() => {
    let alive = true
    if (!years.length) { setDocs({}); return }
    Promise.all(years.map(async (y) => {
      const k = `${cls}-${y}`
      if (!cache.has(k)) cache.set(k, fetch(`/api/classarchive/${cls}/${y}`, { credentials: 'same-origin' }).then((r) => (r.ok ? r.json() : {})).then((x) => x.doc || null).catch(() => null))
      return [y, await cache.get(k)]
    })).then((list) => { if (alive) setDocs(Object.fromEntries(list.filter(([, d]) => d))) })
    return () => { alive = false }
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps
  const events = useMemo(() => Object.values(docs).flatMap((d) => d.events || []), [docs])
  return { docs, events }
}

const fmtSize = (n) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`)
const schoolYearStart = (d = new Date()) => (d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1)

// ── Class settings: tanév lezárása, mentés, archívum ──
export function YearPanel({ doc, cls, onReload }) {
  const [open, setOpen] = useState(false)
  const [year, setYear] = useState(String(schoolYearStart()))
  const [name, setName] = useState('')
  const [keep, setKeep] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const years = doc.previousYears || []
  const backup = () => download(`${cls}-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({ exportedAt: new Date().toISOString(), cls, doc }, null, 1), 'application/json')
  const close = async () => {
    if (!window.confirm(`Close school year ${year}/${String(Number(year) + 1).slice(2)}?\n\nEverything (points, attendance, lesson plans) is saved to the archive and stays in the reports. The new year starts with the same students and codes.`)) return
    setBusy(true); setMsg('')
    try {
      backup()
      const res = await fetch(`/api/classarchive/${cls}`, {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, name, keepSchedule: keep }),
      })
      if (res.status === 409) throw new Error(`${year} is already archived.`)
      if (!res.ok) throw new Error('Could not close the school year. Nothing changed.')
      setOpen(false); onReload?.()
    } catch (e) { setMsg(e.message) } finally { setBusy(false) }
  }
  return (
    <>
      <h3 className="cr-settings__h">School years & backup</h3>
      <div className="cr-upkeep">
        {years.length > 0 && <p className="cr-muted">Archived: {years.map((y) => `${y}/${String(Number(y) + 1).slice(2)}`).join(', ')} – included in the reports (All years).</p>}
        <div className="cr-upkeep__row">
          <button className="cr-btn cr-btn--sm" onClick={backup}><Icon.download />Download backup</button>
          <button className="cr-btn cr-btn--sm" onClick={() => setOpen((o) => !o)}><Art name="calendar" className="cr-art cr-art--xs" />Start new school year…</button>
        </div>
        {open && (
          <div className="cr-upkeep__box">
            <label className="cr-field"><span>School year to close</span>
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                {[0, 1, 2].map((i) => { const y = schoolYearStart() - i; return <option key={y} value={y} disabled={years.includes(String(y))}>{y}/{String(y + 1).slice(2)}</option> })}
              </select>
            </label>
            <label className="cr-field"><span>New class name (optional, e.g. NYEK10B)</span><input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} /></label>
            <label className="cr-check"><input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} /> Keep the weekly timetable</label>
            {msg && <p className="cr-codeform__err">{msg}</p>}
            <div className="cr-form__actions"><span className="cr-spacer" /><button className="cr-btn cr-btn--primary" disabled={busy} onClick={close}>Archive & start new year</button></div>
          </div>
        )}
      </div>
    </>
  )
}

// ── Class settings: fájlok (tárhely) – mi használatban, mi törölhető ──
export function FilesPanel({ doc, cls }) {
  const [files, setFiles] = useState(null)
  const [show, setShow] = useState(false)
  const { docs } = useArchives(cls, show ? doc.previousYears || [] : [])
  useEffect(() => {
    if (!show) return
    fetch(`/api/classfile/${cls}`, { credentials: 'same-origin' }).then((r) => (r.ok ? r.json() : { files: [] })).then((x) => setFiles(x.files || [])).catch(() => setFiles([]))
  }, [show, cls])
  // hivatkozások: az idei és az archivált tanévek óratervei
  const used = useMemo(() => {
    const m = new Map()
    const scan = (d, label) => Object.values({ ...(d.today || {}), ...(d.plans || {}) }).forEach((p) => (Array.isArray(p) ? p : p?.items || []).forEach((it) => (it.resources || []).forEach((r) => { if (r.fileId) m.set(r.fileId, [...(m.get(r.fileId) || []), label]) })))
    scan(doc, 'this year')
    Object.entries(docs).forEach(([y, d]) => scan(d, y))
    return m
  }, [doc, docs])
  const total = (files || []).reduce((a, f) => a + (f.size || 0), 0)
  const remove = async (f) => {
    if (!window.confirm(`Delete “${f.name}” for good? It isn't used in any lesson plan.`)) return
    const res = await fetch(`/api/classfile/${cls}/${f.id}`, { method: 'DELETE', credentials: 'same-origin' })
    if (res.ok) setFiles((l) => l.filter((x) => x.id !== f.id))
  }
  return (
    <>
      <h3 className="cr-settings__h">Files {files && <small className="cr-muted">· {files.length} · {fmtSize(total)}</small>}</h3>
      {!show ? (
        <button className="cr-btn cr-btn--sm" onClick={() => setShow(true)}><Art name="clip" className="cr-art cr-art--xs" />Show uploaded files</button>
      ) : !files ? <p className="cr-muted">Loading…</p> : (
        <ul className="cr-files">
          {[...files].sort((a, b) => (b.at || 0) - (a.at || 0)).map((f) => {
            const u = used.get(f.id)
            return (
              <li key={f.id} className={u ? '' : 'is-unused'}>
                <Art name={f.type?.startsWith('image/') ? 'file' : fileArt(f.type)} className="cr-art cr-art--sm" />
                <a href={`/api/classfile/${cls}/${f.id}`} target="_blank" rel="noopener noreferrer">{f.name}</a>
                <small className="cr-muted">{fmtSize(f.size || 0)}</small>
                <small className={u ? 'cr-muted' : 'cr-files__unused'}>{u ? `used ${u.length}× (${[...new Set(u)].join(', ')})` : 'not used'}</small>
                {!u && <button className="cr-iconbtn cr-iconbtn--sm" onClick={() => remove(f)} aria-label={`Delete ${f.name}`}><Icon.trash /></button>}
              </li>
            )
          })}
          {!files.length && <li className="cr-muted">No uploaded files yet.</li>}
        </ul>
      )}
    </>
  )
}

// ── Osztálynyilvántartás (a tanári felületről bővíthető) ──
let classCache = null
export function useClassList() {
  const [list, setList] = useState(classCache || CLASSES)
  const [loaded, setLoaded] = useState(Boolean(classCache))
  const refresh = async () => {
    try {
      const res = await fetch('/api/classes', { credentials: 'same-origin', cache: 'no-store' })
      if (!res.ok) return
      const { classes = [] } = await res.json()
      if (classes.length) {
        classCache = classes.map((c) => ({ ...c, area: `language-${c.id}` }))
        setList(classCache)
      }
    } catch { /* marad az alap */ } finally { setLoaded(true) }
  }
  useEffect(() => { refresh() }, [])
  return { list, refresh, loaded }
}

const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '').slice(0, 12)

export function AddClassSheet({ taken = [], onClose, onAdded }) {
  const [label, setLabel] = useState('')
  const [id, setId] = useState('')
  const [touched, setTouched] = useState(false)
  const [pw, setPw] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const theId = touched ? id : slug(label)
  const ok = label.trim() && /^[a-z0-9]{1,12}$/.test(theId) && !taken.includes(theId) && pw.trim().length >= 6
  const submit = async (e) => {
    e.preventDefault()
    if (!ok) return
    setBusy(true); setMsg('')
    try {
      const res = await fetch('/api/classes', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: theId, label: label.trim(), password: pw }) })
      if (res.status === 409) throw new Error('This short name is taken.')
      if (!res.ok) throw new Error('Could not add the class.')
      onAdded(theId)
    } catch (err) { setMsg(err.message) } finally { setBusy(false) }
  }
  return (
    <Sheet title="New class" onClose={onClose}>
      <form className="cr-form" onSubmit={submit}>
        <label className="cr-field"><span>Name (shown everywhere)</span><input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="NYEK10A" maxLength={24} autoFocus /></label>
        <label className="cr-field"><span>Address · kittipedia.hu/nyelvoktatas/<b>{theId || '…'}</b></span>
          <input value={theId} onChange={(e) => { setTouched(true); setId(slug(e.target.value)) }} maxLength={12} />
        </label>
        {taken.includes(theId) && <p className="cr-codeform__err">This short name is taken.</p>}
        <label className="cr-field"><span>Student password (min. 6 characters) – the class uses it to open its page</span>
          <input value={pw} onChange={(e) => setPw(e.target.value)} type="text" autoComplete="off" spellCheck="false" />
        </label>
        {msg && <p className="cr-codeform__err">{msg}</p>}
        <div className="cr-form__actions"><span className="cr-spacer" /><button className="cr-btn cr-btn--primary" type="submit" disabled={!ok || busy}><Icon.plus />Add class</button></div>
      </form>
    </Sheet>
  )
}

// ── Class settings: név, diákjelszó, elrejtés ──
export function AccessPanel({ cls, meta, onChanged }) {
  const [label, setLabel] = useState(meta?.label || '')
  const [pw, setPw] = useState('')
  const [msg, setMsg] = useState('')
  const patch = async (body, done) => {
    setMsg('')
    const res = await fetch('/api/classes', { method: 'PATCH', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: cls, ...body }) })
    if (!res.ok) { setMsg('Could not save.'); return }
    setMsg(done); onChanged?.()
  }
  return (
    <>
      <h3 className="cr-settings__h">Class page access</h3>
      <div className="cr-upkeep">
        <p className="cr-muted">Students open kittipedia.hu/nyelvoktatas/{cls} with the class password, then their own report with their personal code.</p>
        <div className="cr-upkeep__row">
          <input className="cr-upkeep__input" value={label} onChange={(e) => setLabel(e.target.value)} maxLength={24} aria-label="Class name" />
          <button className="cr-btn cr-btn--sm" disabled={!label.trim() || label === meta?.label} onClick={() => patch({ label: label.trim() }, 'Name saved.')}>Rename</button>
        </div>
        <div className="cr-upkeep__row">
          <input className="cr-upkeep__input" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New student password (min. 6)" autoComplete="off" spellCheck="false" aria-label="New student password" />
          <button className="cr-btn cr-btn--sm" disabled={pw.trim().length < 6} onClick={() => { patch({ password: pw }, 'Password changed – tell the class.'); setPw('') }}>Set password</button>
        </div>
        <div className="cr-upkeep__row">
          <button className="cr-btn cr-btn--sm" onClick={() => patch({ archived: !meta?.archived }, meta?.archived ? 'Class shown again.' : 'Class hidden – its data stays.')}>
            {meta?.archived ? 'Show class again' : 'Hide class (no longer taught)'}
          </button>
        </div>
        {msg && <p className="cr-muted" role="status">{msg}</p>}
      </div>
    </>
  )
}
