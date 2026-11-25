import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Avatar, { ClassAvatar } from './Avatar.jsx'
import { Sheet } from './ui.jsx'
import { RANGES, rangeBounds, inRange, sortStudents, fullName } from './model.js'
import { PlanTimeline, dayLabel } from './plan.jsx'
import './Classroom.css'

/*
  Az osztályoldal (diákok) csak olvasható tablója – ugyanaz a látvány, mint
  a tanári Osztályteremben. A szerver eleve csak a pozitív bejegyzéseket,
  a csoportokat, a mai napirendet és az utasításokat küldi le.
*/
export default function ClassBoard({ cls }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(false)
  const [view, setView] = useState('students')
  const [open, setOpen] = useState(null) // { ids, title, student? }

  useEffect(() => {
    let alive = true
    const load = async () => {
      if (document.hidden) return
      try {
        const res = await fetch(`/api/classview/${cls}`, { credentials: 'same-origin', cache: 'no-store' })
        if (!res.ok) throw new Error(res.status)
        const d = await res.json()
        if (alive) { setData(d); setError(false) }
      } catch {
        if (alive) setError(true)
      }
    }
    load()
    // Frissítés percenként, és amikor visszatérnek a lapra
    const id = setInterval(load, 60000)
    document.addEventListener('visibilitychange', load)
    return () => { alive = false; clearInterval(id); document.removeEventListener('visibilitychange', load) }
  }, [cls])

  const points = useMemo(() => {
    const m = {}
    for (const e of data?.events || []) m[e.s] = (m[e.s] || 0) + e.v
    return m
  }, [data])

  if (!data) return error ? <p className="cr-hint">Couldn't load the points right now. Please try again later.</p> : <div className="cr-skeleton" />

  const students = sortStudents(data.students)
  const total = Object.values(points).reduce((a, b) => a + b, 0)

  return (
    <div className="cr cr-board">
      {data.plan?.items?.length > 0 && (
        <PlanTimeline
          plan={data.plan}
          cls={cls}
          heading={data.isToday === false && data.planDate ? `📅 Next lesson – ${dayLabel(data.planDate, { month: 'long', day: 'numeric', weekday: 'long' })}` : '📅 Today’s lesson plan'}
        />
      )}
      {data.directions?.length > 0 && (
        <div className="cr-board__info">
          <div className="cr-board__card">
            <h3>📋 Directions</h3>
            <ol>{data.directions.map((it, i) => <li key={i}>{it}</li>)}</ol>
          </div>
        </div>
      )}

      <div className="cr-subbar">
        <div className="cr-seg" role="tablist" aria-label="View">
          <button role="tab" aria-selected={view === 'students'} className={view === 'students' ? 'is-active' : ''} onClick={() => setView('students')}>Students</button>
          <button role="tab" aria-selected={view === 'groups'} className={view === 'groups' ? 'is-active' : ''} onClick={() => setView('groups')}>Groups</button>
        </div>
      </div>

      <div className="cr-main">
        {!students.length ? (
          <p className="cr-hint cr-hint--center">Your points will appear here soon.</p>
        ) : view === 'students' ? (
          <div className="cr-grid">
            <button className="cr-tile cr-tile--class" onClick={() => setOpen({ ids: students.map((s) => s.id), title: 'Whole class' })}>
              <span className="cr-tile__art"><ClassAvatar /></span>
              <span className="cr-badge">{total}</span>
              <span className="cr-tile__last">&nbsp;</span>
              <span className="cr-tile__first">Class</span>
            </button>
            {students.map((s) => (
              <button key={s.id} className="cr-tile" onClick={() => setOpen({ ids: [s.id], title: fullName(s), student: s })}>
                <span className="cr-tile__art"><Avatar a={s.avatar} /></span>
                <span className={`cr-badge ${(points[s.id] || 0) === 0 ? 'is-zero' : ''}`}>{points[s.id] || 0}</span>
                <span className="cr-tile__last">{s.last || ' '}</span>
                <span className="cr-tile__first">{s.first}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="cr-grid cr-grid--groups">
            {!data.groups.length && <p className="cr-hint">No groups yet.</p>}
            {data.groups.map((g) => {
              const members = sortStudents(g.ids.map((id) => data.students.find((s) => s.id === id)).filter(Boolean))
              const sum = members.reduce((a, s) => a + (points[s.id] || 0), 0)
              return (
                <div key={g.id} className="cr-group">
                  <button className="cr-group__main" onClick={() => members.length && setOpen({ ids: members.map((s) => s.id), title: g.name })}>
                    <span className="cr-group__faces">{members.slice(0, 5).map((s) => <Avatar key={s.id} a={s.avatar} />)}</span>
                    <span className="cr-badge">{sum}</span>
                    <b>{g.name}</b>
                    <small>{members.map((s) => s.first).join(', ') || 'empty'}</small>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {open && <PointsSheet key="pts" data={data} target={open} points={points} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </div>
  )
}

// Csak olvasható pontlista (pozitív bejegyzések) egy diákra / csoportra / osztályra
function PointsSheet({ data, target, points, onClose }) {
  const [range, setRange] = useState('all')
  const idSet = new Set(target.ids)
  const names = Object.fromEntries(data.students.map((s) => [s.id, fullName(s)]))
  const events = data.events.filter((e) => idSet.has(e.s) && inRange(e.t, rangeBounds(range))).sort((a, b) => b.t - a.t)
  const sum = target.ids.reduce((a, id) => a + (points[id] || 0), 0)
  const multi = target.ids.length > 1

  return (
    <Sheet onClose={onClose} className="cr-target cr-readonly">
      <header className="cr-target__head">
        <span className="cr-target__avatar">{target.student ? <Avatar a={target.student.avatar} /> : <ClassAvatar />}</span>
        <h2>{target.title}</h2>
        <span className="cr-chip"><b>{sum}</b> point{Math.abs(sum) === 1 ? '' : 's'}</span>
      </header>
      <div className="cr-target__content">
        <div className="cr-report">
          <div className="cr-report__bar">
            <select value={range} onChange={(e) => setRange(e.target.value)} aria-label="Period">
              {RANGES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </div>
          {!events.length ? (
            <div className="cr-empty"><span className="cr-empty__icon">🏆</span><b>No points in this period yet</b></div>
          ) : (
            <ul className="cr-report__list">
              {events.map((e) => {
                const d = new Date(e.t)
                return (
                  <li key={e.id}>
                    <span className="cr-report__icon" aria-hidden="true">{e.i}</span>
                    <span className="cr-report__what">
                      <b>{e.n}</b>
                      <small>{multi && `${names[e.s]} · `}{d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', weekday: 'short' })}</small>
                    </span>
                    <span className="cr-report__val">+{e.v}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </Sheet>
  )
}
