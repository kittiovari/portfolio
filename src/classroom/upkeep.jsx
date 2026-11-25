import { useEffect, useMemo, useState } from 'react'
import { Icon } from './ui.jsx'
import { Art, fileArt } from './art.jsx'
import { download } from './model.js'

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
