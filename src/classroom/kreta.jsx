import { useState } from 'react'
import { Sheet, Icon } from './ui.jsx'
import { getPlan, withSkeleton, previousHomework, splitKey, lessonStart, periodOfKey, TRACKED, THRESHOLDS, skillByKey, fullName, sortStudents } from './model.js'
import { trackedCount } from './report.jsx'

export const fileUrl = (cls, id) => `/api/classfile/${cls}/${id}`
const has = (it) => Boolean((it.aim || '').trim() || (it.activity || '').trim() || it.resources?.length)
const PREFIX = { warmer: 'Ráhangolódás', hwreview: 'Házi feladat ellenőrzése', homework: 'Házi feladat' }

// Az E-Kréta naplóba másolható óraleírás lépései (jelenlét és Self-reflection nélkül)
export function kretaSteps(doc, key) {
  const plan = withSkeleton(getPlan(doc, key))
  const prev = previousHomework(doc, key)
  const out = []
  for (const it of plan.items) {
    if (it.role === 'attendance' || it.role === 'reflection') continue
    if (it.role === 'hwreview') {
      if (!prev) continue
      out.push({
        id: it.id, title: `${PREFIX.hwreview}: ${prev.items.map((h) => h.aim).filter(Boolean).join(' · ') || '–'}`,
        text: prev.items.map((h) => h.activity).filter(Boolean).join('\n'),
        resources: prev.items.flatMap((h) => h.resources || []),
      })
      continue
    }
    if (!has(it)) continue
    const t = (it.aim || '').trim()
    out.push({ id: it.id, title: PREFIX[it.role] ? `${PREFIX[it.role]}${t ? `: ${t}` : ''}` : t || 'Feladat', text: (it.activity || '').trim(), resources: it.resources || [] })
  }
  return { title: (plan.title || '').trim(), steps: out }
}

// A kiemelt (3/5/10+) számok – összhangban az osztályriporttal
function highlights(doc) {
  const rows = []
  for (const s of sortStudents(doc.students)) {
    for (const key of TRACKED) {
      const n = trackedCount(doc, s.id, key)
      const sk = skillByKey(doc, key)
      if (sk && n >= THRESHOLDS[0]) rows.push(`${fullName(s)} – ${sk.name}: ${n}×`)
    }
  }
  return rows
}

export function kretaText(doc, key) {
  const { date } = splitKey(key)
  const [y, m, d] = date.split('-').map(Number)
  const day = new Date(y, m - 1, d).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
  const p = periodOfKey(key)
  const start = lessonStart(doc, key) || splitKey(key).time
  const { title, steps } = kretaSteps(doc, key)
  const lines = [`${day}${p >= 0 ? ` – ${p}. óra` : ''}${start ? ` (${start})` : ''}`]
  if (title) lines.push(`Téma: ${title}`)
  lines.push('')
  steps.forEach((s, i) => {
    lines.push(`${i + 1}. ${s.title}`)
    if (s.text) s.text.split(/\r?\n/).filter((x) => x.trim()).forEach((x) => lines.push(`   ${x.trim()}`))
    for (const r of s.resources) {
      lines.push(r.type === 'file' ? `   Melléklet: ${r.name} (letöltve)` : `   Forrás: ${r.name && r.name !== r.url ? `${r.name} – ` : ''}${r.url}`)
    }
  })
  const hl = highlights(doc)
  lines.push('', 'Beváltott pontok / kiemelések:')
  if (hl.length) hl.forEach((x) => lines.push(`   ${x}`))
  else lines.push('   –')
  return lines.join('\n')
}

export function KretaSheet({ doc, cls, lessonKey, onClose }) {
  const text = kretaText(doc, lessonKey)
  const files = kretaSteps(doc, lessonKey).steps.flatMap((s) => s.resources).filter((r) => r.type === 'file' && r.fileId)
  const [copied, setCopied] = useState(false)
  const [got, setGot] = useState(0)

  const copy = async () => {
    try { await navigator.clipboard.writeText(text) } catch {
      const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove()
    }
    setCopied(true); setTimeout(() => setCopied(false), 1800)
  }
  const downloadAll = async () => {
    setGot(0)
    for (const r of files) {
      const a = document.createElement('a')
      a.href = `${fileUrl(cls, r.fileId)}?dl=1`; a.download = r.name || 'file'
      document.body.appendChild(a); a.click(); a.remove()
      setGot((n) => n + 1)
      await new Promise((res) => setTimeout(res, 450))
    }
  }

  return (
    <Sheet title="E-Kréta" onClose={onClose} className="cr-kreta">
      <pre className="cr-kreta__text">{text}</pre>
      <div className="cr-form__actions">
        {files.length > 0 && (
          <button className="cr-btn" onClick={downloadAll}><Icon.download />Download files ({files.length}){got > 0 && got === files.length ? ' ✓' : ''}</button>
        )}
        <span className="cr-spacer" />
        <button className="cr-btn cr-btn--primary" onClick={copy}>{copied ? <><Icon.check />Copied</> : <><Icon.list />Copy text</>}</button>
      </div>
    </Sheet>
  )
}
