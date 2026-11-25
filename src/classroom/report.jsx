import { useMemo, useState } from 'react'
import Avatar from './Avatar.jsx'
import { Icon } from './ui.jsx'
import { TRACKED, THRESHOLDS, skillByKey, pickName, fullName, lessonLabel, sortStudents } from './model.js'

// ── Időszakok ──
const DAY = 86400000
const sod = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
const fmt = (d, o = { day: 'numeric', month: 'short' }) => d.toLocaleDateString('en-GB', o)

// tanév: a beállított első/utolsó nap, különben szept. 1. – aug. 31.
function schoolYear(doc, now = new Date()) {
  const y = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1
  const c = doc.calendar || {}
  const start = c.start && parse(c.start) <= now ? parse(c.start) : new Date(y, 8, 1)
  const end = c.end && parse(c.end) >= start ? new Date(parse(c.end).getTime() + DAY) : new Date(y + 1, 8, 1)
  return [start, end, y]
}

// [from, to) és felirat egy nézethez + eltoláshoz (0 = aktuális, -1 = előző …)
export function periodBounds(doc, view, offset = 0, now = new Date()) {
  const t = sod(now)
  if (view === 'week') {
    const from = new Date(t); from.setDate(t.getDate() - ((t.getDay() + 6) % 7) + offset * 7)
    const to = new Date(from); to.setDate(from.getDate() + 7)
    return { from, to, label: `${fmt(from)} – ${fmt(new Date(to - DAY))}` }
  }
  if (view === 'month') {
    const from = new Date(t.getFullYear(), t.getMonth() + offset, 1)
    return { from, to: new Date(from.getFullYear(), from.getMonth() + 1, 1), label: fmt(from, { month: 'long', year: 'numeric' }) }
  }
  if (view === 'year') {
    const [s, e, y] = schoolYear(doc, new Date(t.getFullYear() + offset, t.getMonth(), t.getDate()))
    return { from: s, to: e, label: `School year ${y}/${String(y + 1).slice(2)}` }
  }
  // félév: I. a tanév elejétől jan. 31-ig, II. febr. 1-től a végéig
  const [s, e, y] = schoolYear(doc, t)
  const mid = new Date(y + 1, 1, 1)
  let idx = (t >= mid ? 1 : 0) + offset
  const yy = y + Math.floor(idx / 2); idx = ((idx % 2) + 2) % 2
  const [ys, ye] = yy === y ? [s, e] : [new Date(yy, 8, 1), new Date(yy + 1, 8, 1)]
  const m = new Date(yy + 1, 1, 1)
  return idx === 0
    ? { from: ys, to: m, label: `Semester 1 · ${yy}/${String(yy + 1).slice(2)}` }
    : { from: m, to: ye, label: `Semester 2 · ${yy}/${String(yy + 1).slice(2)}` }
}

// ── Segédek ──
export const keyOfEvent = (doc, e) => {
  const all = [...(doc.skills?.positive || []), ...(doc.skills?.negative || [])]
  return all.find((k) => k.id === e.k)?.key || (e.auto === 'late' ? 'late' : null)
}
// E-Kréta számláló: a nullázás óta eltelt alkalmak
export function trackedCount(doc, sid, key) {
  const since = doc.resets?.[sid]?.[key] || 0
  return doc.events.filter((e) => e.s === sid && e.t > since && keyOfEvent(doc, e) === key).length
}
const level = (n) => [...THRESHOLDS].reverse().find((x) => n >= x) || 0

// a diagram színei (rögzített sorrend, a legnagyobb szelettől)
const SERIES = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#8c8a85']

function Donut({ slices }) {
  const total = slices.reduce((s, x) => s + x.n, 0)
  const [hover, setHover] = useState(null)
  const R = 62, r = 40, C = 80
  let a0 = -Math.PI / 2
  const arcs = slices.map((s, i) => {
    const a1 = a0 + (s.n / total) * Math.PI * 2
    const big = a1 - a0 > Math.PI ? 1 : 0
    const p = (a, rad) => `${C + rad * Math.cos(a)} ${C + rad * Math.sin(a)}`
    const d = slices.length === 1
      ? `M ${C} ${C - R} A ${R} ${R} 0 1 1 ${C - 0.01} ${C - R} L ${C - 0.01} ${C - r} A ${r} ${r} 0 1 0 ${C} ${C - r} Z`
      : `M ${p(a0, R)} A ${R} ${R} 0 ${big} 1 ${p(a1, R)} L ${p(a1, r)} A ${r} ${r} 0 ${big} 0 ${p(a0, r)} Z`
    a0 = a1
    return <path key={s.id} d={d} fill={SERIES[i]} stroke="#fff" strokeWidth="2" opacity={hover && hover !== s.id ? 0.35 : 1}
      onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)}><title>{`${s.name}: ${s.n}×`}</title></path>
  })
  const h = slices.find((s) => s.id === hover)
  return (
    <div className="cr-donut">
      <svg viewBox="0 0 160 160" role="img" aria-label="Points by category">
        {arcs}
        <text x="80" y="76" textAnchor="middle" className="cr-donut__num">{h ? h.n : total}</text>
        <text x="80" y="94" textAnchor="middle" className="cr-donut__lbl">{h ? h.name.slice(0, 18) : 'times'}</text>
      </svg>
      <ul className="cr-donut__legend">
        {slices.map((s, i) => (
          <li key={s.id} onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)}>
            <i style={{ background: SERIES[i] }} /><span>{s.icon} {s.name}</span><b>{s.n}×</b><small className={s.v < 0 ? 'is-neg' : 'is-pos'}>{s.v > 0 ? `+${s.v}` : s.v}</small>
          </li>
        ))}
      </ul>
    </div>
  )
}

function slicesOf(events) {
  const by = {}
  for (const e of events) {
    const id = `${e.i}${e.n}`
    by[id] = by[id] || { id, icon: e.i, name: e.n, n: 0, v: 0 }
    by[id].n += 1; by[id].v += e.v
  }
  const list = Object.values(by).sort((a, b) => b.n - a.n)
  if (list.length <= 8) return list
  const rest = list.slice(7)
  return [...list.slice(0, 7), { id: 'other', icon: '·', name: `Other (${rest.length})`, n: rest.reduce((s, x) => s + x.n, 0), v: rest.reduce((s, x) => s + x.v, 0) }]
}

function Totals({ events }) {
  const pos = events.filter((e) => e.v > 0).reduce((s, e) => s + e.v, 0)
  const neg = events.filter((e) => e.v < 0).reduce((s, e) => s - e.v, 0)
  return (
    <div className="cr-report__nums">
      <span><b className="is-pos">+{pos}</b> positive</span>
      <span><b className="is-neg">−{neg}</b> needs work</span>
      <span><b>{pos - neg}</b> net</span>
    </div>
  )
}

// követett viselkedések: hányszor és mikor (diák) / kinél (osztály)
function TrackedStats({ doc, events, multi }) {
  const rows = TRACKED.map((key) => {
    const sk = skillByKey(doc, key)
    const ev = events.filter((e) => keyOfEvent(doc, e) === key).sort((a, b) => a.t - b.t)
    return { key, sk, ev }
  }).filter((r) => r.sk)
  const names = (ev) => {
    const c = {}
    for (const e of ev) c[e.s] = (c[e.s] || 0) + 1
    return Object.entries(c).sort((a, b) => b[1] - a[1]).map(([id, n]) => {
      const s = doc.students.find((x) => x.id === id)
      return `${s ? pickName(s, doc.students) : '?'}${n > 1 ? ` ×${n}` : ''}`
    })
  }
  const days = (ev) => {
    const c = new Map()
    for (const e of ev) { const d = fmt(new Date(e.t), { weekday: 'short', day: 'numeric', month: 'short' }); c.set(d, (c.get(d) || 0) + 1) }
    return [...c].map(([d, n]) => `${d}${n > 1 ? ` ×${n}` : ''}`)
  }
  return (
    <div className="cr-tracked">
      <h4>Tracked behaviour</h4>
      {rows.map(({ key, sk, ev }) => (
        <div key={key} className={`cr-tracked__row ${ev.length ? '' : 'is-zero'}`}>
          <span className="cr-tracked__icon" aria-hidden="true">{sk.icon}</span>
          <span className="cr-tracked__name">{sk.name}</span>
          <b className={sk.value < 0 ? 'is-neg' : 'is-pos'}>{ev.length}×</b>
          <span className="cr-tracked__when">
            {(multi ? names(ev) : days(ev)).map((x, i) => <span key={i}>{x}</span>)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Egy óra részletes listája ──
function LessonView({ doc, update, ids, multi }) {
  const idSet = useMemo(() => new Set(ids), [ids])
  const mine = doc.events.filter((e) => idSet.has(e.s))
  const keys = [...new Set(mine.map((e) => e.l).filter(Boolean))].sort().reverse()
  const [key, setKey] = useState(keys[0] || '')
  const events = mine.filter((e) => e.l === key).sort((a, b) => a.t - b.t)
  const names = Object.fromEntries(doc.students.map((s) => [s.id, fullName(s)]))
  const removeEvent = (id) => update((d) => ({ ...d, events: d.events.filter((e) => e.id !== id) }))
  if (!keys.length) return <Empty text="No points given in a lesson yet." />
  return (
    <>
      <div className="cr-report__bar">
        <select value={key} onChange={(e) => setKey(e.target.value)} aria-label="Lesson">
          {keys.map((k) => <option key={k} value={k}>{lessonLabel(k, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }, doc)}</option>)}
        </select>
      </div>
      <Totals events={events} />
      <ul className="cr-report__list">
        {events.map((e) => (
          <li key={e.id}>
            <span className="cr-report__icon" aria-hidden="true">{e.i}</span>
            <span className="cr-report__what">
              <b>{e.n}</b>
              <small>{multi && `${names[e.s] || '(deleted student)'} · `}{e.sn || ''}</small>
            </span>
            <span className={`cr-report__val ${e.v < 0 ? 'is-neg' : ''}`}>{e.v > 0 ? `+${e.v}` : e.v}</span>
            <button className="cr-iconbtn cr-iconbtn--sm" onClick={() => removeEvent(e.id)} aria-label="Undo point" title="Undo"><Icon.close /></button>
          </li>
        ))}
      </ul>
    </>
  )
}

// ── Heti / havi / féléves / éves: kördiagram + követett viselkedések ──
function PeriodView({ doc, ids, view, multi }) {
  const [offset, setOffset] = useState(0)
  const { from, to, label } = periodBounds(doc, view, offset)
  const idSet = new Set(ids)
  const events = doc.events.filter((e) => idSet.has(e.s) && e.t >= from.getTime() && e.t < to.getTime())
  return (
    <>
      <PeriodNav label={label} onPrev={() => setOffset((o) => o - 1)} onNext={() => setOffset((o) => o + 1)} nextDisabled={offset >= 0} />
      {!events.length ? <Empty text="No points in this period." /> : (
        <>
          <Totals events={events} />
          <Donut slices={slicesOf(events)} />
          <TrackedStats doc={doc} events={events} multi={multi} />
        </>
      )}
    </>
  )
}

function PeriodNav({ label, onPrev, onNext, nextDisabled }) {
  return (
    <div className="cr-pnav">
      <button className="cr-iconbtn cr-iconbtn--sm" onClick={onPrev} aria-label="Previous">‹</button>
      <b>{label}</b>
      <button className="cr-iconbtn cr-iconbtn--sm" onClick={onNext} disabled={nextDisabled} aria-label="Next">›</button>
    </div>
  )
}
const Empty = ({ text }) => <div className="cr-empty"><span className="cr-empty__icon">🏆</span><b>{text}</b></div>

// ── E-Kréta: 10 körös számlálók nullázással ──
function Dots({ n }) {
  return (
    <span className="cr-dots" aria-label={`${n} times`}>
      {Array.from({ length: 10 }, (_, i) => <i key={i} className={i < n ? (i >= 9 ? 'is-l3' : i >= 4 ? 'is-l2' : i >= 2 ? 'is-l1' : 'is-on') : ''} />)}
      {n > 10 && <b>+{n - 10}</b>}
    </span>
  )
}
export function Alerts({ doc, update, ids, all = false }) {
  const rows = []
  for (const sid of ids) {
    for (const key of TRACKED) {
      const sk = skillByKey(doc, key)
      const n = trackedCount(doc, sid, key)
      if (sk && (all ? true : n >= THRESHOLDS[0])) rows.push({ sid, key, sk, n })
    }
  }
  rows.sort((a, b) => b.n - a.n)
  const reset = (sid, key, name) => {
    if (!window.confirm(`Restart the count of “${name}”?`)) return
    update((d) => ({ ...d, resets: { ...(d.resets || {}), [sid]: { ...(d.resets?.[sid] || {}), [key]: Date.now() } } }))
  }
  return (
    <div className="cr-alerts">
      <h4>{all ? 'E-Kréta counters' : 'E-Kréta alerts · 3 / 5 / 10+'}</h4>
      {!rows.length && <p className="cr-muted">No one has reached 3 yet.</p>}
      {rows.map(({ sid, key, sk, n }) => {
        const s = doc.students.find((x) => x.id === sid)
        if (!s) return null
        const lv = level(n)
        return (
          <div key={sid + key} className={`cr-alert ${lv ? `is-l${THRESHOLDS.indexOf(lv) + 1}` : ''}`}>
            {!all && <Avatar a={s.avatar} />}
            <span className="cr-alert__who">{!all && <b>{pickName(s, doc.students)}</b>}<small>{sk.icon} {sk.name}</small></span>
            <Dots n={n} />
            {lv > 0 && <span className="cr-alert__lv">{lv}{lv === 10 ? '+' : ''}</span>}
            <button className="cr-btn cr-btn--sm" onClick={() => reset(sid, key, sk.name)} disabled={!n} title="Restart count">Reset</button>
          </div>
        )
      })}
    </div>
  )
}

// ── Osztály-összesítő: ki mennyit tett hozzá egy tanulási ciklusban (Unit / időszak) ──
function Overview({ doc, update }) {
  const units = (doc.units || []).filter((u) => u.from && u.to).sort((a, b) => (a.from < b.from ? -1 : 1))
  const today = iso(new Date())
  const cur = units.find((u) => u.from <= today && today <= u.to) || units.filter((u) => u.from <= today).pop()
  const [cycle, setCycle] = useState(cur ? `u:${cur.id}` : 'p:month')
  const bounds = (() => {
    if (cycle.startsWith('u:')) {
      const u = units.find((x) => `u:${x.id}` === cycle)
      if (u) return { from: parse(u.from), to: new Date(parse(u.to).getTime() + DAY), label: `${fmt(parse(u.from))} – ${fmt(parse(u.to))}` }
    }
    return periodBounds(doc, cycle.slice(2) || 'month', 0)
  })()
  const ev = doc.events.filter((e) => e.t >= bounds.from.getTime() && e.t < bounds.to.getTime())
  const rows = sortStudents(doc.students).map((s) => {
    const mine = ev.filter((e) => e.s === s.id)
    const pos = mine.filter((e) => e.v > 0).reduce((a, e) => a + e.v, 0)
    const neg = mine.filter((e) => e.v < 0).reduce((a, e) => a - e.v, 0)
    return { s, pos, neg, net: pos - neg }
  }).sort((a, b) => b.net - a.net)
  const max = Math.max(1, ...rows.map((r) => Math.max(r.pos, r.neg)))
  return (
    <>
      <Alerts doc={doc} update={update} ids={doc.students.map((s) => s.id)} />
      <div className="cr-overview">
        <div className="cr-report__bar">
          <h4>Contribution</h4>
          <span className="cr-spacer" />
          <select value={cycle} onChange={(e) => setCycle(e.target.value)} aria-label="Learning cycle">
            {units.length > 0 && <optgroup label="Units">{units.map((u) => <option key={u.id} value={`u:${u.id}`}>{u.name || 'Unit'}</option>)}</optgroup>}
            <optgroup label="Period">
              <option value="p:week">This week</option>
              <option value="p:month">This month</option>
              <option value="p:semester">This semester</option>
              <option value="p:year">This school year</option>
            </optgroup>
          </select>
        </div>
        <p className="cr-muted cr-overview__range">{bounds.label}{!units.length && ' · add units in Class settings'}</p>
        <ul className="cr-bars">
          {rows.map(({ s, pos, neg, net }) => (
            <li key={s.id} title={`+${pos} / −${neg}`}>
              <span className="cr-bars__name">{pickName(s, doc.students)}</span>
              <span className="cr-bars__track">
                <span className="cr-bars__neg"><i style={{ width: `${(neg / max) * 100}%` }} /></span>
                <span className="cr-bars__pos"><i style={{ width: `${(pos / max) * 100}%` }} /></span>
              </span>
              <b className={net < 0 ? 'is-neg' : ''}>{net > 0 ? `+${net}` : net}</b>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

const VIEWS = [
  { id: 'lesson', label: 'Lesson' }, { id: 'week', label: 'Week' }, { id: 'month', label: 'Month' },
  { id: 'semester', label: 'Semester' }, { id: 'year', label: 'Year' },
]

export function ReportPanel({ doc, update, ids, isClass = false, studentId = null }) {
  const views = isClass ? [{ id: 'overview', label: 'Overview' }, ...VIEWS] : VIEWS
  const [view, setView] = useState(views[0].id)
  const multi = ids.length > 1
  return (
    <div className="cr-report">
      <div className="cr-seg cr-seg--report" role="tablist" aria-label="Report view">
        {views.map((v) => <button key={v.id} role="tab" aria-selected={view === v.id} className={view === v.id ? 'is-active' : ''} onClick={() => setView(v.id)}>{v.label}</button>)}
      </div>
      {view === 'overview' && <Overview doc={doc} update={update} />}
      {view === 'lesson' && <LessonView doc={doc} update={update} ids={ids} multi={multi} />}
      {['week', 'month', 'semester', 'year'].includes(view) && <PeriodView key={view} doc={doc} ids={ids} view={view} multi={multi} />}
      {studentId && view !== 'lesson' && <Alerts doc={doc} update={update} ids={[studentId]} all />}
    </div>
  )
}
