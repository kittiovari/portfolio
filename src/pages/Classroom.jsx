import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Avatar, { AvatarThemeContext, ClassAvatar } from '../classroom/Avatar.jsx'
import { Icon, play, isMuted, setMuted } from '../classroom/ui.jsx'
import { TargetModal, AddStudents, GroupEditor, HomeworkWizard, AttendanceWizard, PointsWizard } from '../classroom/StudentModal.jsx'
import {
  Toolkit, RandomTool, GroupMakerTool, DirectionsTool, TpsTool,
} from '../classroom/tools.jsx'
import { PlanEditor, ClassSettings, LessonBoard, OrgIcon } from '../classroom/plan.jsx'
import { SessionSetup, SessionPlayer } from '../classroom/session.jsx'
import { useClassroom } from '../classroom/useClassroom.js'
import { SkillArt } from '../classroom/art.jsx'
import { useArchives, useClassList, AddClassSheet } from '../classroom/upkeep.jsx'
import { classArt } from '../components/AreaIllustrations.jsx'
import SeasonScene from '../classroom/SeasonScene.jsx'
import Deskmates from '../classroom/Deskmates.jsx'
import { useStudentWork, ExtraReview, pendingCount } from '../classroom/extratask.jsx'
import { PrivilegeRequests, pendingRequests } from '../classroom/privmenu.jsx'
import { Art } from '../classroom/art.jsx'
import { ATTENDANCE, dayKey, fullName, pickName, getPlan, stepSkills, withSkeleton, skillByKey, pointsBy, sortStudents, uid } from '../classroom/model.js'
import '../components/PasswordModal.css'
import '../classroom/Classroom.css'

const STATUS = {
  loading: 'Loading…',
  ready: 'Saved',
  saved: 'Saved',
  saving: 'Saving…',
  error: 'Save failed – retry',
  conflict: 'Changed on another device – updated',
  locked: 'Session expired',
}

export function ClassroomIndex() {
  let last = '9b'
  try { last = localStorage.getItem('cr-class') || '9b' } catch { /* */ }
  if (!/^[a-z0-9]{1,12}$/.test(last)) last = '9b'
  return <Navigate to={`/classroom/${last}`} replace />
}

export default function Classroom() {
  const { cls } = useParams()
  const navigate = useNavigate()
  const { list: classList, refresh: refreshClasses, loaded: classesLoaded } = useClassList()
  const meta = classList.find((c) => c.id === cls)
  // ismeretlen (pl. törölt) osztály → az első
  useEffect(() => { if (classesLoaded && !meta && classList[0]) navigate(`/classroom/${classList[0].id}`, { replace: true }) }, [classesLoaded, meta]) // eslint-disable-line react-hooks/exhaustive-deps
  const { doc, status, update, retry, reload } = useClassroom(meta ? cls : '9b')
  // az archivált tanévek eseményei is a riportokba kerülnek (tanéveken átívelő kép)
  const archives = useArchives(meta ? cls : '9b', doc?.previousYears || [])
  // a diákok saját munkái (szorgalmi beadások, kiváltság-kérések) – csak tanári sütivel
  const studentWork = useStudentWork(meta ? cls : '9b', Boolean(doc))
  // a friss beadás-pontok ráfésülése a betöltött dokumentumra (csak ha változott)
  useEffect(() => {
    if (!doc || !studentWork.events) return
    const sig = (list) => list.map((e) => `${e.id}:${e.v}:${e.t}`).sort().join('|')
    if (sig(doc.events.filter((e) => e.src === 'x')) === sig(studentWork.events)) return
    update((d) => ({ ...d, events: [...d.events.filter((e) => e.src !== 'x'), ...studentWork.events] }))
  }, [studentWork.events]) // eslint-disable-line react-hooks/exhaustive-deps

  const [view, setView] = useState('students') // students | groups
  const [mode, setMode] = useState('normal') // normal | attendance | select
  const [selected, setSelected] = useState(() => new Set())
  const [draftAtt, setDraftAtt] = useState({})
  const [modal, setModal] = useState(null) // { kind, ... }
  const [toast, setToast] = useState(null)
  const [floats, setFloats] = useState([])
  const [muted, setMutedState] = useState(isMuted())
  const [session, setSession] = useState(null) // futó „Időzítő és zene”
  const [activeStep, setActiveStep] = useState(null) // { key, itemId, title } – erre a feladatra mennek a pontok

  useEffect(() => { try { localStorage.setItem('cr-class', cls) } catch { /* */ } }, [cls])
  useEffect(() => { setMode('normal'); setSelected(new Set()); setModal(null); setActiveStep(null) }, [cls])
  // kijelölt feladat → a diáknézet a munkaformát követi (pár → Pairs, csoport → Groups)
  const stepOrgNow = activeStep && doc ? (withSkeleton(getPlan(doc, activeStep.key)).items.find((x) => x.id === activeStep.itemId)?.org || '') : ''
  useEffect(() => {
    if (!activeStep) return
    setView(stepOrgNow === 'pairs' ? 'pairs' : stepOrgNow === 'groups' ? 'groups' : 'students')
  }, [activeStep?.key, activeStep?.itemId, stepOrgNow]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(id)
  }, [toast])

  const points = useMemo(() => (doc ? pointsBy(doc.events) : {}), [doc])
  if (!meta) return <Navigate to="/classroom" replace />

  const today = dayKey()
  const att = doc?.attendance?.[today] || {}
  const absent = (id) => att[id] === 'absent'
  const classTotal = doc ? doc.events.reduce((s, e) => s + e.v, 0) : 0

  // ── Pont adása (egy vagy több diáknak) ──
  const award = (ids, skill, label) => {
    const now = Date.now()
    const step = activeStep ? { l: activeStep.key, st: activeStep.itemId, sn: activeStep.title } : {}
    const evs = ids.map((s) => ({ id: uid(), s, k: skill.id, n: skill.name, i: skill.icon, v: skill.value, t: now, ...step }))
    update((d) => ({ ...d, events: [...d.events, ...evs] }))
    play(skill.value > 0 ? 'positive' : 'negative')
    const one = ids.length === 1 ? doc.students.find((s) => s.id === ids[0]) : null
    setToast({ key: now, student: one, label: one ? fullName(one) : label, skill, count: ids.length, step: activeStep?.title })
    setFloats((f) => [...f, ...ids.map((s) => ({ key: `${now}-${s}`, s, v: skill.value }))])
    setTimeout(() => setFloats((f) => f.filter((x) => !x.key.startsWith(`${now}-`))), 1400)
    if (mode === 'select') { setMode('normal'); setSelected(new Set()) }
  }

  const presentIds = doc ? doc.students.filter((s) => !absent(s.id)).map((s) => s.id) : []
  // a csoportok csak arra a napra érvényesek, amikor készültek – minden új órán üresen indul
  // a csoportok a mai vagy egy előre megtervezett (későbbi) óra napjára érvényesek
  // a csoportok megmaradnak, amíg újat nem készítünk → az új csoportmunkánál a korábbi az alapértelmezett
  const groupsToday = doc?.groups || []

  // ── Pontadás: mindig egy kijelölt lépéshez (feladathoz) kötve ──
  const [notice, setNotice] = useState(null)
  useEffect(() => { if (!notice) return; const id = setTimeout(() => setNotice(null), 2600); return () => clearTimeout(id) }, [notice])
  const stepItem = (step) => step && doc ? withSkeleton(getPlan(doc, step.key)).items.find((x) => x.id === step.itemId) : null
  const givePoints = (ids = [], step = activeStep) => {
    if (!step) { setNotice('Select a task in the lesson timeline to give points'); return }
    if (step.role === 'hwreview') return setModal({ kind: 'homework', preselect: ids })
    if (step.role === 'attendance') return setModal({ kind: 'attendance', date: step.key.slice(0, 10) })
    if (!stepSkills(doc, stepItem(step)).length) { setNotice('No points are set for this step – add them in the lesson plan'); return }
    setModal({ kind: 'points', step, preselect: ids })
  }

  // ── Csempe kattintás módtól függően ──
  const onStudent = (s) => {
    if (mode === 'attendance') {
      setDraftAtt((a) => ({ ...a, [s.id]: ATTENDANCE[a[s.id] || 'present'].next }))
    } else if (mode === 'select') {
      setSelected((set) => { const n = new Set(set); n.has(s.id) ? n.delete(s.id) : n.add(s.id); return n })
    } else if (activeStep) {
      givePoints([s.id])
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
        <Link to="/" className="cr-back" aria-label="Back to Kittipedia"><Icon.back /></Link>
        <div className="cr-classes" role="tablist" aria-label="Class">
          {classList.filter((c) => !c.archived || c.id === cls).map((c) => {
            const Art = classArt(c.area)
            return (
              <button key={c.id} role="tab" aria-selected={c.id === cls}
                className={`cr-class ${c.id === cls ? 'is-active' : ''}`}
                onClick={() => navigate(`/classroom/${c.id}`)}>
                <span className={`cr-class__badge pw-profile__circle--${c.area}`}>{Art && <Art />}</span>
                {c.label}
              </button>
            )
          })}
          <button className="cr-iconbtn cr-class__add" onClick={() => setModal({ kind: 'addclass' })} aria-label="Add a class" title="Add a class"><Icon.plus /></button>
        </div>
      </div>
      <div className="cr-top__right">
        {doc && (
          <button className="cr-iconbtn cr-inboxbtn" onClick={() => { studentWork.reload(); setModal({ kind: 'extra', task: null }) }} aria-label="Extra tasks handed in" title="Extra tasks handed in">
            <Art name="extra_hw" className="cr-art cr-art--sm" />
            {pendingCount(studentWork.work) > 0 && <i className="cr-inboxbtn__n">{pendingCount(studentWork.work)}</i>}
          </button>
        )}
        {doc && (
          <button className="cr-iconbtn cr-inboxbtn" onClick={() => { studentWork.reload(); setModal({ kind: 'privreq' }) }} aria-label="Privilege requests" title="Privilege requests">
            <Art name="ticket" className="cr-art cr-art--sm" />
            {pendingRequests(studentWork.work) > 0 && <i className="cr-inboxbtn__n">{pendingRequests(studentWork.work)}</i>}
          </button>
        )}
        <span className={`cr-status is-${status}`} role="status">
          {status === 'error' ? <button className="cr-link" onClick={retry}>{STATUS.error}</button> : STATUS[status]}
        </span>
        <button className="cr-iconbtn" onClick={() => { setMuted(!muted); setMutedState(!muted) }} aria-label={muted ? 'Sound on' : 'Sound off'} title={muted ? 'Sound on' : 'Sound off'}>
          {muted ? <Icon.mute /> : <Icon.sound />}
        </button>
        {doc && (
          <button className="cr-iconbtn" onClick={() => setModal({ kind: 'settings' })} aria-label="Class settings" title="Class settings (timetable)">
            <Icon.gear />
          </button>
        )}
      </div>
    </header>
  )

  if (!doc) {
    return (
      <div className="cr">
        {header}
        <main className="cr-main" aria-busy={status === 'loading'}>
          {status === 'locked'
            ? <p className="cr-hint">Your session has expired. <a href={`/classroom/${cls}`}>Reload the page</a> and enter the password again.</p>
            : status === 'error' ? <p className="cr-hint">Couldn't load the data. <button className="cr-link" onClick={() => window.location.reload()}>Try again</button></p>
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
        aria-label={`${s.first} ${s.last}, ${p} point${Math.abs(p) === 1 ? '' : 's'}${a && a !== 'present' ? `, ${ATTENDANCE[a].label}` : ''}`}
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
        <span className="cr-tile__last">{s.last || ' '}</span>
        <span className="cr-tile__first">{s.first}</span>
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
    <AvatarThemeContext.Provider value={doc?.avatarTheme || 'monsters'}>
    <div className={`cr cr--${mode}`}>
      {header}

      <div className="cr-main cr-main--board">
        {(
          <LessonBoard key={cls} doc={doc} update={update} cls={cls} active={activeStep} onSelect={setActiveStep}
            onMakeGroups={(size, date) => setModal({ kind: 'tool', id: 'groups', size, date, fromBoard: true })}
            onCheckHomework={() => setModal({ kind: 'homework', preselect: [] })}
            onTakeAttendance={(date, key, itemId) => setModal({ kind: 'attendance', date, key, itemId })}
            onGivePoints={(step) => givePoints([], step)}
            work={studentWork.work} onReviewExtra={(task) => { studentWork.reload(); setModal({ kind: 'extra', task }) }}
            onEdit={(k) => setModal({ kind: 'tool', id: 'today', key: k })} />
        )}
      </div>

      <div className="cr-subbar">
        {activeStep ? (
          <p className="cr-formlabel"><OrgIcon id={stepOrgNow || 'frontal'} /><span><b>{activeStep.title}</b> · {stepOrgNow === 'pairs' ? 'pair work – tap a desk or a student' : stepOrgNow === 'groups' ? 'group work – tap a group or a student' : stepOrgNow === 'individual' ? 'individual work – tap a student' : 'tap a student or the class'}</span></p>
        ) : (
          <div className="cr-seg" role="tablist" aria-label="View">
            <button role="tab" aria-selected={view === 'students'} className={view === 'students' ? 'is-active' : ''} onClick={() => setView('students')}>Students</button>
            <button role="tab" aria-selected={view === 'pairs'} className={view === 'pairs' ? 'is-active' : ''} onClick={() => setView('pairs')}>Pairs</button>
            <button role="tab" aria-selected={view === 'groups'} className={view === 'groups' ? 'is-active' : ''} onClick={() => setView('groups')}>Groups</button>
          </div>
        )}
        {mode === 'attendance' && <p className="cr-modehint">Attendance – tap a student: present → absent → late → left early</p>}
        {mode === 'select' && <p className="cr-modehint">Select who gets points ({selected.size})</p>}
      </div>

      <main className="cr-main">
        {view === 'students' ? ((
          <div className="cr-grid">
            <button
              className={`cr-tile cr-tile--class ${mode !== 'normal' ? 'is-dim' : ''}`}
              onClick={() => mode === 'select'
                ? setSelected(selected.size === presentIds.length ? new Set() : new Set(presentIds))
                : mode === 'normal' && (activeStep ? givePoints([]) : setModal({ kind: 'target', target: { type: 'class' } }))}
              disabled={mode === 'attendance'}
            >
              <span className="cr-tile__art"><ClassAvatar /></span>
              {mode === 'normal' && <span className={`cr-badge ${classTotal < 0 ? 'is-neg' : ''}`}>{classTotal}</span>}
              <span className="cr-tile__first">{mode === 'select' ? (selected.size === presentIds.length && presentIds.length ? 'Nobody' : 'Everyone') : 'Class'}</span>
            </button>
            {sortStudents(doc.students).map(studentTile)}
            {mode === 'normal' && (
              <button className="cr-tile cr-tile--add" onClick={() => setModal({ kind: 'add' })}>
                <span className="cr-tile__plus"><Icon.plus /></span>
                <span className="cr-tile__first">Add students</span>
              </button>
            )}
          </div>
        )) : view === 'pairs' ? (
          <Deskmates doc={doc} update={update} points={points}
            onGive={(ids) => givePoints(ids)} />
        ) : (
          <div className="cr-grid cr-grid--groups">
            {groupsToday.map((g) => {
              const members = g.ids.map((id) => doc.students.find((s) => s.id === id)).filter(Boolean)
              return (
                <div key={g.id} className="cr-group">
                  <button className="cr-group__main" onClick={() => members.length && (activeStep ? givePoints(members.map((s) => s.id)) : setModal({ kind: 'target', target: { type: 'multi', ids: members.map((s) => s.id), title: g.name } }))}>
                    <span className="cr-group__faces">
                      {members.slice(0, 5).map((s) => <Avatar key={s.id} a={s.avatar} />)}
                      {members.length > 5 && <span className="cr-group__more">+{members.length - 5}</span>}
                    </span>
                    <span className="cr-group__name">
                      <b>{g.name}</b>
                    </span>
                    <small>{members.map((s) => pickName(s, doc.students)).join(', ') || 'empty'}</small>
                  </button>
                  <span className="cr-group__actions">
                    <button className="cr-iconbtn cr-iconbtn--sm" aria-label="Edit group" title="Edit" onClick={() => setModal({ kind: 'group', group: g })}><Icon.pencil /></button>
                    <button className="cr-iconbtn cr-iconbtn--sm" aria-label="Delete group" title="Delete"
                      onClick={() => { if (window.confirm(`Delete ${g.name}? Students and their points stay.`)) update((d) => ({ ...d, groups: d.groups.filter((x) => x.id !== g.id) })) }}><Icon.trash /></button>
                  </span>
                </div>
              )
            })}
            {activeStep ? (
              <button className="cr-tile cr-tile--add cr-group--add" onClick={() => setModal({ kind: 'tool', id: 'groups', size: null, date: today, fromBoard: true })}>
                <span className="cr-tile__plus"><Icon.shuffle /></span>
                <span className="cr-tile__first">{groupsToday.length ? 'Make new groups' : 'Make groups'}</span>
                {groupsToday.length > 0 && <small className="cr-muted">or keep these from last time</small>}
              </button>
            ) : (
              <button className="cr-tile cr-tile--add cr-group--add" onClick={() => setModal({ kind: 'group', group: null })}>
                <span className="cr-tile__plus"><Icon.plus /></span>
                <span className="cr-tile__first">New group</span>
                <small className="cr-muted">or: Toolkit → Group maker</small>
              </button>
            )}
            {groupsToday.length > 1 && (
              <button className="cr-link cr-groups__clear" onClick={() => { if (window.confirm('Delete all groups? Students and their points stay.')) update((d) => ({ ...d, groups: [] })) }}>
                <Icon.trash />Delete all groups
              </button>
            )}
          </div>
        )}
      </main>

      {/* Évszakos tájkép a képernyő alján (évszakváltáskor magától cserélődik) */}
      <SeasonScene />

      {/* Alsó eszközsor */}
      <nav className="cr-dock" aria-label="Tools">
        {mode === 'normal' && (
          <>
            <button className="cr-dockbtn" onClick={() => setModal({ kind: 'toolkit' })}><Icon.grid />Toolkit</button>
            <button className="cr-dockbtn" onClick={() => setModal({ kind: 'tool', id: 'random' })} disabled={!doc.students.length}><Icon.shuffle />Random</button>
            <button className="cr-dockbtn" onClick={() => setModal({ kind: 'tool', id: 'session' })}><Icon.timer />Timer & music</button>
          </>
        )}
        {mode === 'attendance' && (
          <>
            <button className="cr-dockbtn cr-dockbtn--flat" onClick={() => setDraftAtt(Object.fromEntries(doc.students.map((s) => [s.id, 'present'])))}><span className="cr-att cr-att--present cr-att--inline"><AttIcon /></span>All present</button>
            <button className="cr-dockbtn cr-dockbtn--flat" onClick={() => setDraftAtt(Object.fromEntries(doc.students.map((s) => [s.id, 'absent'])))}><span className="cr-att cr-att--absent cr-att--inline"><AttIcon /></span>All absent</button>
            <span className="cr-spacer" />
            <button className="cr-dockbtn cr-dockbtn--flat" onClick={() => setMode('normal')}>Cancel</button>
            <button className="cr-dockbtn cr-dockbtn--primary" onClick={saveAttendance}><Icon.check />Save attendance</button>
          </>
        )}
        {mode === 'select' && (
          <>
            <button className="cr-dockbtn cr-dockbtn--flat" onClick={() => setSelected(new Set(presentIds))}>Everyone</button>
            <button className="cr-dockbtn cr-dockbtn--flat" onClick={() => setSelected(new Set())}>Nobody</button>
            <span className="cr-spacer" />
            <button className="cr-dockbtn cr-dockbtn--flat" onClick={() => { setMode('normal'); setSelected(new Set()) }}>Cancel</button>
            <button className="cr-dockbtn cr-dockbtn--primary" disabled={!selected.size}
              onClick={() => (activeStep?.role === 'hwreview'
                ? (setModal({ kind: 'homework', preselect: [...selected] }), setMode('normal'), setSelected(new Set()))
                : setModal({ kind: 'target', target: { type: 'multi', ids: [...selected], title: `${selected.size} selected student${selected.size === 1 ? '' : 's'}` } }))}>
              <Icon.plus />Give points ({selected.size})
            </button>
          </>
        )}
      </nav>

      {/* Modálok és eszközök */}
      <AnimatePresence>
        {modal?.kind === 'target' && (
          <TargetModal key="target" classLabel={meta.label} doc={archives.events.length ? { ...doc, events: [...archives.events, ...doc.events] } : doc} target={modal.target} points={points} update={update} onClose={closeModal}
            absentIds={doc.students.filter((s) => absent(s.id)).map((s) => s.id)}
            onAward={(ids, sk, label) => award(modal.target.type === 'class' ? presentIds : ids, sk, label)} />
        )}
        {modal?.kind === 'points' && (() => {
          const step = modal.step || activeStep
          const item = stepItem(step)
          const date = step.key.slice(0, 10)
          const here = doc.students.filter((s) => doc.attendance?.[date]?.[s.id] !== 'absent').map((s) => s.id)
          return (
            <PointsWizard key="points" doc={doc} skills={stepSkills(doc, item)} stepTitle={step.title} presentIds={here} preselect={modal.preselect || []}
              units={item?.org === 'pairs' ? (doc.deskmates || []).map((ids, i) => ({ id: `d${i}`, label: `Desk ${i + 1}`, ids }))
                : item?.org === 'groups' ? groupsToday.map((g) => ({ id: g.id, label: g.name, ids: g.ids })) : null}
              unitLabel={item?.org === 'pairs' ? 'pair' : 'group'}
              onClose={closeModal}
              onSave={(skill, ids) => { award(ids, skill, `${ids.length} student${ids.length === 1 ? '' : 's'}`); closeModal() }} />
          )
        })()}
        {modal?.kind === 'attendance' && (
          <AttendanceWizard key="attendance" doc={doc} date={modal.date} onClose={closeModal}
            onSave={(map) => {
              const late = skillByKey(doc, 'late')
              const lateIds = Object.keys(map).filter((id) => map[id] === 'late')
              update((d) => {
                // korábbi automatikus késés-pontok törlése ennél az óránál, majd az újak
                const events = d.events.filter((e) => !(e.auto === 'late' && e.l === modal.key))
                const add = late && modal.key ? lateIds.map((s) => ({ id: uid(), s, k: late.id, n: late.name, i: late.icon, v: late.value, t: Date.now(), l: modal.key, st: modal.itemId, sn: 'Attendance', auto: 'late' })) : []
                return { ...d, attendance: { ...d.attendance, [modal.date]: map }, events: [...events, ...add] }
              })
              if (late && lateIds.length) play('negative')
              closeModal()
            }} />
        )}
        {modal?.kind === 'homework' && (
          <HomeworkWizard key="homework" doc={doc} presentIds={activeStep?.key ? doc.students.filter((s) => doc.attendance?.[activeStep.key.slice(0, 10)]?.[s.id] !== 'absent').map((s) => s.id) : presentIds} preselect={modal.preselect || []} onClose={closeModal}
            onSave={(doneIds, missingIds, doneSkill, missSkill, perfectIds = [], extraIds = []) => {
              const ds = doneSkill || { id: 'hw-done', name: 'Homework done', icon: '👍', value: 2 }
              const ms = missSkill || { id: 'hw-missing', name: 'No homework', icon: '🗑️', value: -2 }
              if (doneIds.length) award(doneIds, ds, `${doneIds.length} student${doneIds.length === 1 ? '' : 's'}`)
              if (missingIds.length) setTimeout(() => award(missingIds, ms, `${missingIds.length} student${missingIds.length === 1 ? '' : 's'}`), doneIds.length ? 900 : 0)
              const ph = skillByKey(doc, 'perfect_hw'), xh = skillByKey(doc, 'extra_hw')
              if (ph && perfectIds.length) setTimeout(() => award(perfectIds, ph, `${perfectIds.length} student${perfectIds.length === 1 ? '' : 's'}`), 1800)
              if (xh && extraIds.length) setTimeout(() => award(extraIds, xh, `${extraIds.length} student${extraIds.length === 1 ? '' : 's'}`), 2700)
              closeModal()
            }} />
        )}
        {modal?.kind === 'extra' && studentWork.work && (
          <ExtraReview key="extra" doc={doc} cls={cls} work={studentWork.work} post={studentWork.post} initialTask={modal.task} onClose={closeModal} />
        )}
        {modal?.kind === 'privreq' && studentWork.work && (
          <PrivilegeRequests key="privreq" doc={doc} work={studentWork.work} post={studentWork.post} points={points} onClose={closeModal} />
        )}
        {modal?.kind === 'add' && <AddStudents key="add" update={update} onClose={closeModal} />}
        {modal?.kind === 'group' && <GroupEditor key="group" doc={doc} group={modal.group} update={update} onClose={closeModal} />}
        {modal?.kind === 'toolkit' && <Toolkit key="kit" onPick={openTool} onClose={closeModal} />}
        {modal?.kind === 'tool' && modal.id === 'session' && (
          <SessionSetup key="session" doc={doc} update={update} onClose={closeModal} onBack={modal.fromKit ? backToKit : undefined}
            onStart={(s) => { setSession(s); closeModal() }} />
        )}
        {modal?.kind === 'tool' && modal.id === 'random' && (
          <RandomTool key="random" doc={doc} onClose={closeModal}
            onGive={(id) => givePoints([id])} />
        )}
        {modal?.kind === 'tool' && modal.id === 'groups' && <GroupMakerTool key="groups" doc={doc} update={update} initialSize={modal.size || null} date={modal.date}
          onClose={() => { closeModal(); if (!modal.fromBoard) setView('groups') }} onBack={modal.fromBoard ? undefined : backToKit} />}
        {modal?.kind === 'tool' && modal.id === 'directions' && <DirectionsTool key="dir" doc={doc} update={update} onClose={closeModal} onBack={backToKit} />}
        {modal?.kind === 'tool' && modal.id === 'tps' && <TpsTool key="tps" doc={doc} update={update} onClose={closeModal} onBack={backToKit} />}
        {modal?.kind === 'tool' && modal.id === 'today' && <PlanEditor key="today" doc={doc} update={update} cls={cls} initialKey={modal.key} onClose={closeModal} onBack={modal.fromKit ? backToKit : undefined} onOpenSettings={() => setModal({ kind: 'settings' })} />}
        {modal?.kind === 'settings' && <ClassSettings key="settings" doc={doc} update={update} onClose={closeModal} className={meta.label} cls={cls} onReload={reload} meta={meta} onClassesChanged={refreshClasses} />}
        {modal?.kind === 'addclass' && <AddClassSheet key="addclass" taken={classList.map((c) => c.id)} onClose={closeModal} onAdded={async (id) => { await refreshClasses(); closeModal(); navigate(`/classroom/${id}`) }} />}
      </AnimatePresence>

      {/* Időzítő és zene: futás közben teljes képernyő ↔ kompakt */}
      <AnimatePresence>
        {session && <SessionPlayer key={session.key} session={session} onMode={(mode) => setSession((x) => x && { ...x, mode })} onClose={() => setSession(null)} />}
      </AnimatePresence>

      {/* rövid értesítés (pl. ha nincs kijelölt lépés) */}
      <AnimatePresence>
        {notice && (
          <motion.div key={notice} className="cr-notice" role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>{notice}</motion.div>
        )}
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
              <span>{toast.skill.value > 0 ? `+${toast.skill.value}` : toast.skill.value} · {toast.skill.name}{toast.count > 1 && !/student/.test(toast.label) ? ` · ${toast.count} students` : ''}{toast.step ? ` · ${toast.step}` : ''}</span>
            </span>
            <motion.span className="cr-toast__icon" initial={{ rotate: -20, scale: 0.4 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.1 }}>
              <SkillArt skill={toast.skill} className="cr-art cr-art--toast" />
              <i className={toast.skill.value < 0 ? 'is-neg' : ''}>{Math.abs(toast.skill.value)}</i>
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </AvatarThemeContext.Provider>
  )
}

function AttIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 4.5c-2.6 0-4.5 1.9-4.5 4.4V13H6.2c-.7 0-1.2.6-1.1 1.3.1.6.6 1 1.2 1H7.5v3.2c0 .6.4 1 1 1s1-.4 1-1V17h5v1.5c0 .6.4 1 1 1s1-.4 1-1v-3.2h1.2c.6 0 1.1-.4 1.2-1 .1-.7-.4-1.3-1.1-1.3h-1.3V8.9c0-2.5-1.9-4.4-4.5-4.4z" />
    </svg>
  )
}
