import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { profileArt } from '../components/AreaIllustrations.jsx'
import Avatar, { ClassAvatar } from '../classroom/Avatar.jsx'
import { Icon, play, isMuted, setMuted } from '../classroom/ui.jsx'
import { TargetModal, AddStudents, GroupEditor } from '../classroom/StudentModal.jsx'
import {
  Toolkit, TimerTool, RandomTool, GroupMakerTool, DirectionsTool, TpsTool, TodayTool, MusicTool, MusicPlayer,
} from '../classroom/tools.jsx'
import { useClassroom } from '../classroom/useClassroom.js'
import { ATTENDANCE, CLASSES, dayKey, fullName, pointsBy, uid } from '../classroom/model.js'
import '../components/PasswordModal.css'
import '../classroom/Classroom.css'

const STATUS = {
  loading: 'Betöltés…',
  ready: 'Mentve',
  saved: 'Mentve',
  saving: 'Mentés…',
  error: 'Mentési hiba – újrapróbálom',
  conflict: 'Másik eszközön módosult – frissítettem',
  locked: 'Lejárt a belépés',
}

export function ClassroomIndex() {
  let last = '9b'
  try { last = localStorage.getItem('cr-class') || '9b' } catch { /* */ }
  if (!CLASSES.some((c) => c.id === last)) last = '9b'
  return <Navigate to={`/osztalyterem/${last}`} replace />
}

export default function Classroom() {
  const { cls } = useParams()
  const navigate = useNavigate()
  const meta = CLASSES.find((c) => c.id === cls)
  const { doc, status, update, retry } = useClassroom(meta ? cls : '9b')

  const [view, setView] = useState('students') // students | groups
  const [mode, setMode] = useState('normal') // normal | attendance | select
  const [selected, setSelected] = useState(() => new Set())
  const [draftAtt, setDraftAtt] = useState({})
  const [modal, setModal] = useState(null) // { kind, ... }
  const [toast, setToast] = useState(null)
  const [floats, setFloats] = useState([])
  const [muted, setMutedState] = useState(isMuted())
  const [music, setMusic] = useState(null) // relax | active | null

  useEffect(() => { try { localStorage.setItem('cr-class', cls) } catch { /* */ } }, [cls])
  useEffect(() => { setMode('normal'); setSelected(new Set()); setModal(null) }, [cls])
  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(id)
  }, [toast])

  const points = useMemo(() => (doc ? pointsBy(doc.events) : {}), [doc])
  if (!meta) return <Navigate to="/osztalyterem" replace />

  const today = dayKey()
  const att = doc?.attendance?.[today] || {}
  const absent = (id) => att[id] === 'absent'
  const classTotal = doc ? doc.events.reduce((s, e) => s + e.v, 0) : 0

  // ── Pont adása (egy vagy több diáknak) ──
  const award = (ids, skill, label) => {
    const now = Date.now()
    const evs = ids.map((s) => ({ id: uid(), s, k: skill.id, n: skill.name, i: skill.icon, v: skill.value, t: now }))
    update((d) => ({ ...d, events: [...d.events, ...evs] }))
    play(skill.value > 0 ? 'positive' : 'negative')
    const one = ids.length === 1 ? doc.students.find((s) => s.id === ids[0]) : null
    setToast({ key: now, student: one, label: one ? fullName(one) : label, skill, count: ids.length })
    setFloats((f) => [...f, ...ids.map((s) => ({ key: `${now}-${s}`, s, v: skill.value }))])
    setTimeout(() => setFloats((f) => f.filter((x) => !x.key.startsWith(`${now}-`))), 1400)
    if (mode === 'select') { setMode('normal'); setSelected(new Set()) }
  }

  const presentIds = doc ? doc.students.filter((s) => !absent(s.id)).map((s) => s.id) : []

  // ── Csempe kattintás módtól függően ──
  const onStudent = (s) => {
    if (mode === 'attendance') {
      setDraftAtt((a) => ({ ...a, [s.id]: ATTENDANCE[a[s.id] || 'present'].next }))
    } else if (mode === 'select') {
      setSelected((set) => { const n = new Set(set); n.has(s.id) ? n.delete(s.id) : n.add(s.id); return n })
    } else {
      setModal({ kind: 'target', target: { type: 'student', id: s.id } })
    }
  }

  const startAttendance = () => {
    const base = Object.fromEntries(doc.students.map((s) => [s.id, att[s.id] || 'present']))
    setDraftAtt(base)
    setMode('attendance')
  }
  const saveAttendance = () => {
    update((d) => ({ ...d, attendance: { ...d.attendance, [today]: draftAtt } }))
    setMode('normal')
  }

  const openTool = (id) => setModal({ kind: 'tool', id, fromKit: true })
  const closeModal = () => setModal(null)
  const backToKit = () => setModal({ kind: 'toolkit' })

  const header = (
    <header className="cr-top">
      <div className="cr-top__left">
        <Link to="/" className="cr-back" aria-label="Vissza a Kittipediára"><Icon.back /></Link>
        <div className="cr-classes" role="tablist" aria-label="Osztály">
          {CLASSES.map((c) => {
            const Art = profileArt[c.area]
            return (
              <button key={c.id} role="tab" aria-selected={c.id === cls}
                className={`cr-class ${c.id === cls ? 'is-active' : ''}`}
                onClick={() => navigate(`/osztalyterem/${c.id}`)}>
                <span className={`cr-class__badge pw-profile__circle--${c.area}`}>{Art && <Art />}</span>
                {c.label}
              </button>
            )
          })}
        </div>
      </div>
      <div className="cr-top__right">
        <span className={`cr-status is-${status}`} role="status">
          {status === 'error' ? <button className="cr-link" onClick={retry}>{STATUS.error}</button> : STATUS[status]}
        </span>
        <button className="cr-iconbtn" onClick={() => { setMuted(!muted); setMutedState(!muted) }} aria-label={muted ? 'Hang be' : 'Hang ki'} title={muted ? 'Hang be' : 'Hang ki'}>
          {muted ? <Icon.mute /> : <Icon.sound />}
        </button>
      </div>
    </header>
  )

  if (!doc) {
    return (
      <div className="cr">
        {header}
        <main className="cr-main" aria-busy={status === 'loading'}>
          {status === 'locked'
            ? <p className="cr-hint">Lejárt a belépés. <a href={`/osztalyterem/${cls}`}>Frissítsd az oldalt</a>, és add meg újra a jelszót.</p>
            : status === 'error' ? <p className="cr-hint">Nem sikerült betölteni az adatokat. <button className="cr-link" onClick={() => window.location.reload()}>Újrapróbálom</button></p>
            : <div className="cr-skeleton" />}
        </main>
      </div>
    )
  }

  const studentTile = (s) => {
    const p = points[s.id] || 0
    const a = mode === 'attendance' ? draftAtt[s.id] || 'present' : att[s.id]
    const sel = selected.has(s.id)
    return (
      <motion.button
        layout
        key={s.id}
        className={`cr-tile ${a === 'absent' ? 'is-absent' : ''} ${sel ? 'is-selected' : ''} ${toast?.student?.id === s.id ? 'is-awarded' : ''}`}
        onClick={() => onStudent(s)}
        aria-pressed={mode === 'select' ? sel : undefined}
        aria-label={`${s.first} ${s.last}, ${p} pont${a && a !== 'present' ? `, ${ATTENDANCE[a].label}` : ''}`}
      >
        <span className="cr-tile__art"><Avatar a={s.avatar} /></span>
        {mode === 'attendance' ? (
          <span className={`cr-att cr-att--${a || 'present'}`} title={ATTENDANCE[a || 'present'].label}><AttIcon /></span>
        ) : mode === 'select' ? (
          <span className={`cr-tick ${sel ? 'is-on' : ''}`}>{sel && <Icon.check />}</span>
        ) : (
          <span className={`cr-badge ${p < 0 ? 'is-neg' : p === 0 ? 'is-zero' : ''}`}>{p}</span>
        )}
        {mode === 'normal' && a && a !== 'present' && <span className={`cr-att cr-att--mini cr-att--${a}`} title={ATTENDANCE[a].label}><AttIcon /></span>}
        <span className="cr-tile__first">{s.first}</span>
        <span className="cr-tile__last">{s.last}</span>
        <AnimatePresence>
          {floats.filter((f) => f.s === s.id).map((f) => (
            <motion.span key={f.key} className={`cr-float ${f.v < 0 ? 'is-neg' : ''}`}
              initial={{ opacity: 0, y: 6, scale: 0.6 }} animate={{ opacity: 1, y: -26, scale: 1 }} exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}>{f.v > 0 ? `+${f.v}` : f.v}</motion.span>
          ))}
        </AnimatePresence>
      </motion.button>
    )
  }

  return (
    <div className={`cr cr--${mode}`}>
      {header}

      <div className="cr-subbar">
        <div className="cr-seg" role="tablist" aria-label="Nézet">
          <button role="tab" aria-selected={view === 'students'} className={view === 'students' ? 'is-active' : ''} onClick={() => setView('students')}>Diákok</button>
          <button role="tab" aria-selected={view === 'groups'} className={view === 'groups' ? 'is-active' : ''} onClick={() => setView('groups')}>Csoportok</button>
        </div>
        {mode === 'attendance' && <p className="cr-modehint">Jelenlét – kattints egy diákra: jelen → hiányzik → késett → korábban távozott</p>}
        {mode === 'select' && <p className="cr-modehint">Jelöld ki, kiknek adsz pontot ({selected.size})</p>}
      </div>

      <main className="cr-main">
        {view === 'students' ? (
          <div className="cr-grid">
            <button
              className={`cr-tile cr-tile--class ${mode !== 'normal' ? 'is-dim' : ''}`}
              onClick={() => mode === 'select'
                ? setSelected(selected.size === presentIds.length ? new Set() : new Set(presentIds))
                : mode === 'normal' && setModal({ kind: 'target', target: { type: 'class' } })}
              disabled={mode === 'attendance'}
            >
              <span className="cr-tile__art"><ClassAvatar /></span>
              {mode === 'normal' && <span className={`cr-badge ${classTotal < 0 ? 'is-neg' : ''}`}>{classTotal}</span>}
              <span className="cr-tile__first">{mode === 'select' ? (selected.size === presentIds.length && presentIds.length ? 'Senki' : 'Mindenki') : 'Osztály'}</span>
            </button>
            {doc.students.map(studentTile)}
            {mode === 'normal' && (
              <button className="cr-tile cr-tile--add" onClick={() => setModal({ kind: 'add' })}>
                <span className="cr-tile__plus"><Icon.plus /></span>
                <span className="cr-tile__first">Diákok felvétele</span>
              </button>
            )}
          </div>
        ) : (
          <div className="cr-grid cr-grid--groups">
            {doc.groups.map((g) => {
              const members = g.ids.map((id) => doc.students.find((s) => s.id === id)).filter(Boolean)
              const total = members.reduce((sum, s) => sum + (points[s.id] || 0), 0)
              return (
                <div key={g.id} className="cr-group">
                  <button className="cr-group__main" onClick={() => members.length && setModal({ kind: 'target', target: { type: 'multi', ids: members.map((s) => s.id), title: g.name } })}>
                    <span className="cr-group__faces">
                      {members.slice(0, 5).map((s) => <Avatar key={s.id} a={s.avatar} />)}
                      {members.length > 5 && <span className="cr-group__more">+{members.length - 5}</span>}
                    </span>
                    <span className={`cr-badge ${total < 0 ? 'is-neg' : ''}`}>{total}</span>
                    <b>{g.name}</b>
                    <small>{members.map((s) => s.first).join(', ') || 'üres'}</small>
                  </button>
                  <button className="cr-iconbtn cr-group__edit" aria-label="Csoport szerkesztése" onClick={() => setModal({ kind: 'group', group: g })}><Icon.pencil /></button>
                </div>
              )
            })}
            <button className="cr-tile cr-tile--add cr-group--add" onClick={() => setModal({ kind: 'group', group: null })}>
              <span className="cr-tile__plus"><Icon.plus /></span>
              <span className="cr-tile__first">Új csoport</span>
              <small className="cr-muted">vagy: Eszköztár → Csoportkészítő</small>
            </button>
          </div>
        )}
        {!doc.students.length && view === 'students' && (
          <p className="cr-hint cr-hint--center">Kezdd a diákok felvételével – több nevet is bemásolhatsz egyszerre.</p>
        )}
      </main>

      {/* Alsó eszközsor */}
      <nav className="cr-dock" aria-label="Eszközök">
        {mode === 'normal' && (
          <>
            <button className="cr-dockbtn" onClick={() => setModal({ kind: 'toolkit' })}><Icon.grid />Eszköztár</button>
            <button className="cr-dockbtn" onClick={startAttendance} disabled={!doc.students.length}><Icon.clock />Jelenlét</button>
            <button className="cr-dockbtn" onClick={() => { setSelected(new Set()); setMode('select') }} disabled={!doc.students.length}><Icon.checkbox />Többes kijelölés</button>
            <button className="cr-dockbtn" onClick={() => setModal({ kind: 'tool', id: 'random' })} disabled={!doc.students.length}><Icon.shuffle />Véletlen</button>
            <button className="cr-dockbtn" onClick={() => setModal({ kind: 'tool', id: 'timer' })}><Icon.timer />Időzítő</button>
          </>
        )}
        {mode === 'attendance' && (
          <>
            <button className="cr-dockbtn cr-dockbtn--flat" onClick={() => setDraftAtt(Object.fromEntries(doc.students.map((s) => [s.id, 'present'])))}><span className="cr-att cr-att--present cr-att--inline"><AttIcon /></span>Mindenki jelen</button>
            <button className="cr-dockbtn cr-dockbtn--flat" onClick={() => setDraftAtt(Object.fromEntries(doc.students.map((s) => [s.id, 'absent'])))}><span className="cr-att cr-att--absent cr-att--inline"><AttIcon /></span>Mindenki hiányzik</button>
            <span className="cr-spacer" />
            <button className="cr-dockbtn cr-dockbtn--flat" onClick={() => setMode('normal')}>Mégse</button>
            <button className="cr-dockbtn cr-dockbtn--primary" onClick={saveAttendance}><Icon.check />Jelenlét mentése</button>
          </>
        )}
        {mode === 'select' && (
          <>
            <button className="cr-dockbtn cr-dockbtn--flat" onClick={() => setSelected(new Set(presentIds))}>Mindenki</button>
            <button className="cr-dockbtn cr-dockbtn--flat" onClick={() => setSelected(new Set())}>Senki</button>
            <span className="cr-spacer" />
            <button className="cr-dockbtn cr-dockbtn--flat" onClick={() => { setMode('normal'); setSelected(new Set()) }}>Mégse</button>
            <button className="cr-dockbtn cr-dockbtn--primary" disabled={!selected.size}
              onClick={() => setModal({ kind: 'target', target: { type: 'multi', ids: [...selected], title: `${selected.size} kijelölt diák` } })}>
              <Icon.plus />Pont adása ({selected.size})
            </button>
          </>
        )}
      </nav>

      {/* Modálok és eszközök */}
      <AnimatePresence>
        {modal?.kind === 'target' && (
          <TargetModal key="target" doc={doc} target={modal.target} points={points} update={update} onClose={closeModal}
            onAward={(ids, sk, label) => award(modal.target.type === 'class' ? presentIds : ids, sk, label)} />
        )}
        {modal?.kind === 'add' && <AddStudents key="add" update={update} onClose={closeModal} />}
        {modal?.kind === 'group' && <GroupEditor key="group" doc={doc} group={modal.group} update={update} onClose={closeModal} />}
        {modal?.kind === 'toolkit' && <Toolkit key="kit" onPick={openTool} onClose={closeModal} />}
        {modal?.kind === 'tool' && modal.id === 'timer' && <TimerTool key="timer" onClose={closeModal} onBack={modal.fromKit ? backToKit : undefined} />}
        {modal?.kind === 'tool' && modal.id === 'random' && (
          <RandomTool key="random" doc={doc} onClose={closeModal}
            onGive={(id) => setModal({ kind: 'target', target: { type: 'student', id } })} />
        )}
        {modal?.kind === 'tool' && modal.id === 'groups' && <GroupMakerTool key="groups" doc={doc} update={update} onClose={() => { closeModal(); setView('groups') }} onBack={backToKit} />}
        {modal?.kind === 'tool' && modal.id === 'music' && <MusicTool key="music" doc={doc} update={update} onClose={closeModal} onBack={backToKit} onPlay={(ch) => { setMusic(ch); closeModal() }} />}
        {modal?.kind === 'tool' && modal.id === 'directions' && <DirectionsTool key="dir" doc={doc} update={update} onClose={closeModal} onBack={backToKit} />}
        {modal?.kind === 'tool' && modal.id === 'tps' && <TpsTool key="tps" doc={doc} update={update} onClose={closeModal} onBack={backToKit} />}
        {modal?.kind === 'tool' && modal.id === 'today' && <TodayTool key="today" doc={doc} update={update} onClose={closeModal} onBack={backToKit} />}
      </AnimatePresence>

      {/* Zene: lebegő mini lejátszó (az eszköztár bezárása után is szól) */}
      <AnimatePresence>
        {music && <MusicPlayer key="player" doc={doc} channel={music} onChange={setMusic} onClose={() => setMusic(null)} />}
      </AnimatePresence>

      {/* Pontozás visszajelzése */}
      <AnimatePresence>
        {toast && (
          <motion.div key={toast.key} className={`cr-toast ${toast.skill.value < 0 ? 'is-neg' : ''}`} role="status"
            initial={{ opacity: 0, y: 30, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}>
            <span className="cr-toast__avatar">{toast.student ? <Avatar a={toast.student.avatar} /> : <ClassAvatar />}</span>
            <span className="cr-toast__text">
              <b>{toast.label}</b>
              <span>{toast.skill.value > 0 ? `+${toast.skill.value}` : toast.skill.value} · {toast.skill.name}{toast.count > 1 ? ` · ${toast.count} diák` : ''}</span>
            </span>
            <motion.span className="cr-toast__icon" initial={{ rotate: -20, scale: 0.4 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.1 }}>
              {toast.skill.icon}
              <i className={toast.skill.value < 0 ? 'is-neg' : ''}>{Math.abs(toast.skill.value)}</i>
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function AttIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 4.5c-2.6 0-4.5 1.9-4.5 4.4V13H6.2c-.7 0-1.2.6-1.1 1.3.1.6.6 1 1.2 1H7.5v3.2c0 .6.4 1 1 1s1-.4 1-1V17h5v1.5c0 .6.4 1 1 1s1-.4 1-1v-3.2h1.2c.6 0 1.1-.4 1.2-1 .1-.7-.4-1.3-1.1-1.3h-1.3V8.9c0-2.5-1.9-4.4-4.5-4.4z" />
    </svg>
  )
}
