import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Avatar, { ClassAvatar, AvatarThemeContext } from './Avatar.jsx'
import { Sheet, Icon } from './ui.jsx'
import { sortStudents, fullName, pickName, lessonLabel } from './model.js'
import { PlanTimeline, Resource, Linkify } from './plan.jsx'
import { Art } from './art.jsx'
import { ReportPanel } from './report.jsx'
import SeasonScene from './SeasonScene.jsx'
import './Classroom.css'

/*
  Az osztályoldal (diákok) – ugyanaz, mint a tanári Osztályterem, csak olvasható.
  A közös jelszóval: a tanév óratervei, csoportok, padtársak és a pozitív pontok.
  A saját, teljes riport (fejlesztendők, E-Kréta-számlálók) csak a személyes
  kóddal nyílik meg, és csak az adott diáké.
*/
const codeKey = (cls) => `kp-code-${cls}`
const ssGet = (k) => { try { return sessionStorage.getItem(k) } catch { return null } }
const ssSet = (k, v) => { try { if (v) sessionStorage.setItem(k, v); else sessionStorage.removeItem(k) } catch { /* */ } }

async function fetchMe(cls, code) {
  const res = await fetch(`/api/studentview/${cls}`, {
    method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(body.error || res.status), { body, status: res.status })
  return body
}

export default function ClassBoard({ cls }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(false)
  const [open, setOpen] = useState(null) // { ids, title, student?, isClass? }
  const [lessonKey, setLessonKey] = useState(null)
  const [me, setMe] = useState(null)
  const [asking, setAsking] = useState(false)

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
    const id = setInterval(load, 60000)
    document.addEventListener('visibilitychange', load)
    return () => { alive = false; clearInterval(id); document.removeEventListener('visibilitychange', load) }
  }, [cls])

  // a böngészőfülön megjegyzett kóddal (csak erre a munkamenetre) újra betölti a saját riportot
  useEffect(() => {
    setMe(null)
    const code = ssGet(codeKey(cls))
    if (code) fetchMe(cls, code).then(setMe).catch(() => ssSet(codeKey(cls), null))
  }, [cls])

  const points = useMemo(() => {
    const m = {}
    for (const e of data?.events || []) m[e.s] = (m[e.s] || 0) + e.v
    return m
  }, [data])

  // a riportok „doc”-ja: nyilvános (csak pozitív) és saját (minden adatom)
  const publicDoc = useMemo(() => data && ({
    students: data.students, events: data.events,
    skills: { positive: (data.skills || []).filter((k) => k.value > 0), negative: (data.skills || []).filter((k) => k.value < 0) },
    calendar: data.calendar || {}, units: data.units || [], shortDays: data.shortDays || [], resets: {},
  }), [data])
  const myDoc = useMemo(() => publicDoc && me && ({
    ...publicDoc, events: [...publicDoc.events.filter((e) => e.s !== me.id), ...me.events], resets: { [me.id]: me.resets || {} },
  }), [publicDoc, me])

  if (!data) return error ? <p className="cr-hint">Couldn't load the class page right now. Please try again later.</p> : <div className="cr-skeleton" />

  const students = sortStudents(data.students)
  const total = Object.values(points).reduce((a, b) => a + b, 0)
  const meStudent = me && data.students.find((s) => s.id === me.id)
  const lessons = data.lessons || []
  const key = lessonKey || data.planKey || lessons[lessons.length - 1]?.key
  const lesson = lessons.find((l) => l.key === key)
  // a legutóbbi (ma vagy korábban kiadott) házi és a határideje (a következő óra)
  const today = new Date().toISOString().slice(0, 10)
  const isHw = (it) => it.role === 'homework' || (!it.role && it.tags?.includes('homework'))
  const homework = (() => {
    const given = [...lessons].reverse().find((l) => l.date <= today && l.items.some((it) => isHw(it) && (it.aim || it.activity || it.resources?.length)))
    if (!given) return null
    const due = lessons.find((l) => l.key > given.key)?.key || null
    return { items: given.items.filter((it) => isHw(it) && (it.aim || it.activity || it.resources?.length)), due }
  })()
  const signOut = () => { ssSet(codeKey(cls), null); setMe(null) }

  return (
    <AvatarThemeContext.Provider value={data.avatarTheme || 'monsters'}>
    <div className="cr cr-board">
      {homework && (
        <div className="cr-board__info cr-board__info--hw">
          <div className="cr-board__card cr-hwcard">
            <h3><Art name="homework" className="cr-art cr-art--lg" />Next homework{homework.due ? <small>due {lessonLabel(homework.due, { weekday: 'long', day: 'numeric', month: 'long' }, publicDoc)}</small> : null}</h3>
            {homework.items.map((h) => (
              <div key={h.id} className="cr-hwcard__item">
                {h.aim && <b>{h.aim}</b>}
                {h.activity && <p><Linkify text={h.activity} /></p>}
                {h.resources?.length > 0 && <div className="cr-tcard__res">{h.resources.map((r) => <Resource key={r.id} r={r} cls={cls} />)}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
      {lesson && (
        <div className="cr-board__lesson">
          <label className="cr-board__pick">
            <span className="sr-only">Lesson</span>
            <select value={key} onChange={(e) => setLessonKey(e.target.value)}>
              {lessons.map((l) => <option key={l.key} value={l.key}>{lessonLabel(l.key, { weekday: 'short', day: 'numeric', month: 'short' }, publicDoc)}{l.key === data.planKey ? (data.isToday ? ' · today' : ' · next') : ''}</option>)}
            </select>
          </label>
          <PlanTimeline
            plan={lesson}
            cls={cls}
            heading={`${lessonLabel(lesson.key, { weekday: 'long', day: 'numeric', month: 'long' }, publicDoc)}`}
            startTime={lesson.time}
          />
        </div>
      )}

      <div className="cr-subbar">
        {meStudent ? (
          <span className="cr-mebar">
            <button className="cr-btn cr-btn--sm cr-btn--primary" onClick={() => setOpen({ ids: [meStudent.id], title: fullName(meStudent), student: meStudent })}>My report</button>
            <button className="cr-link" onClick={signOut}>Sign out</button>
          </span>
        ) : (
          <button className="cr-btn cr-btn--sm" onClick={() => setAsking(true)}><Icon.people />My report</button>
        )}
      </div>

      <div className="cr-main">
        {!students.length ? (
          <p className="cr-hint cr-hint--center">Your points will appear here soon.</p>
        ) : (
          <div className="cr-grid">
            <button className="cr-tile cr-tile--class" onClick={() => setOpen({ ids: students.map((s) => s.id), title: 'Class', isClass: true })}>
              <span className="cr-tile__art"><ClassAvatar /></span>
              <span className="cr-badge">{total}</span>
              <span className="cr-tile__last">&nbsp;</span>
              <span className="cr-tile__first">Class</span>
            </button>
            {students.map((s) => (
              <button key={s.id} className={`cr-tile ${me?.id === s.id ? 'is-me' : ''}`} onClick={() => setOpen({ ids: [s.id], title: fullName(s), student: s })}>
                <span className="cr-tile__art"><Avatar a={s.avatar} /></span>
                <span className={`cr-badge ${(points[s.id] || 0) === 0 ? 'is-zero' : ''}`}>{points[s.id] || 0}</span>
                <span className="cr-tile__last">{s.last || ' '}</span>
                <span className="cr-tile__first">{s.first}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* évszakos tájkép a lap alján – ugyanaz, mint a tanári oldalon */}
      <SeasonScene />

      <AnimatePresence>
        {open && (() => {
          const mine = me && open.student?.id === me.id
          const doc = mine ? myDoc : publicDoc
          const sum = open.ids.reduce((a, id) => a + doc.events.filter((e) => e.s === id).reduce((x, e) => x + e.v, 0), 0)
          return (
            <Sheet key="rep" onClose={() => setOpen(null)} wide className="cr-target cr-readonly">
              <header className="cr-target__head">
                <span className="cr-target__avatar">{open.student ? <Avatar a={open.student.avatar} /> : <ClassAvatar />}</span>
                <h2>{open.title}</h2>
                <span className={`cr-chip ${sum < 0 ? 'cr-chip--neg' : ''}`}><b>{sum}</b> point{Math.abs(sum) === 1 ? '' : 's'}</span>
                {!mine && open.student && <span className="cr-chip cr-chip--muted">positive points</span>}
              </header>
              <div className="cr-target__content">
                <ReportPanel doc={doc} update={null} ids={open.ids} isClass={Boolean(open.isClass)} studentId={mine ? me.id : null} publicView={!mine} />
              </div>
            </Sheet>
          )
        })()}
        {asking && <CodeSheet key="code" cls={cls} onClose={() => setAsking(false)} onOk={(d, code) => { ssSet(codeKey(cls), code); setMe(d); setAsking(false); const s = data.students.find((x) => x.id === d.id); if (s) setOpen({ ids: [s.id], title: fullName(s), student: s }) }} />}
      </AnimatePresence>
    </div>
    </AvatarThemeContext.Provider>
  )
}

function CodeSheet({ cls, onClose, onOk }) {
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setMsg('')
    try {
      onOk(await fetchMe(cls, code), code)
    } catch (err) {
      setMsg(err.status === 429 ? `Too many tries. Wait ${Math.ceil((err.body?.retryAfter || 900) / 60)} minutes.`
        : err.status === 401 ? `Wrong code.${err.body?.remaining != null ? ` ${err.body.remaining} tries left.` : ''}` : 'Something went wrong. Try again.')
    } finally { setBusy(false) }
  }
  return (
    <Sheet title="My report" onClose={onClose}>
      <form className="cr-form cr-codeform" onSubmit={submit}>
        <p className="cr-muted">Type the personal code you got from your teacher. Only you can see your full report with it.</p>
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} autoFocus autoComplete="off" autoCapitalize="characters" spellCheck="false" maxLength={12} aria-label="Personal code" placeholder="ABC123" />
        {msg && <p className="cr-codeform__err" role="alert">{msg}</p>}
        <div className="cr-form__actions"><span className="cr-spacer" /><button className="cr-btn cr-btn--primary" type="submit" disabled={busy || code.trim().length < 6}>Open</button></div>
      </form>
    </Sheet>
  )
}
