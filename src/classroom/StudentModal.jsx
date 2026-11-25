import { useMemo, useState } from 'react'
import Avatar, { ClassAvatar } from './Avatar.jsx'
import { Sheet, Icon } from './ui.jsx'
import {
  AVATAR, RANGES, sortStudents, pickName, rangeBounds, inRange, fullName, uid, parseName, randomAvatar, toCsv, download, dayKey,
} from './model.js'

/*
  Diák / egész osztály / kijelölt diákok paneljei.
  target: { type: 'student', id } | { type: 'class' } | { type: 'multi', ids, title }
*/
export function TargetModal({ doc, target, points, onAward, update, onClose, initialTab = 'give', homeworkMode = false, absentIds = [] }) {
  const student = target.type === 'student' ? doc.students.find((s) => s.id === target.id) : null
  const [tab, setTab] = useState(target.type === 'class' ? 'rules' : initialTab === 'give' ? 'report' : initialTab)
  if (target.type === 'student' && !student) return null

  const ids = target.type === 'student' ? [student.id] : target.type === 'multi' ? target.ids : doc.students.map((s) => s.id)
  const total = target.type === 'student'
    ? points[student.id] || 0
    : ids.reduce((sum, id) => sum + (points[id] || 0), 0)
  const title = student ? fullName(student) : target.type === 'class' ? 'Everyone' : target.title

  const tabs = [
    ...(target.type === 'class' ? [{ id: 'rules', label: 'Point rules', icon: <Icon.pencil /> }] : []),
    { id: 'report', label: 'Report', icon: <Icon.list /> },
    ...(student ? [{ id: 'custom', label: 'Customise', icon: <Icon.pencil /> }] : []),
  ]

  return (
    <Sheet onClose={onClose} wide className="cr-target">
      <header className="cr-target__head">
        <span className="cr-target__avatar">{student ? <Avatar a={student.avatar} /> : <ClassAvatar />}</span>
        <h2>{title}</h2>
        <span className={`cr-chip ${total < 0 ? 'cr-chip--neg' : ''}`}><b>{total}</b> point{Math.abs(total) === 1 ? '' : 's'}</span>
        {student && absentIds.includes(student.id) && <span className="cr-chip cr-chip--absent">Absent</span>}
        {target.type === 'multi' && <span className="cr-chip cr-chip--muted">{ids.length} student{ids.length === 1 ? '' : 's'}</span>}
      </header>
      <div className="cr-target__layout">
        <nav className="cr-target__nav" aria-label="Menu">
          {tabs.map((t) => (
            <button key={t.id} className={`cr-navbtn ${tab === t.id ? 'is-active' : ''}`} onClick={() => setTab(t.id)}>
              {t.icon}{t.label}
            </button>
          ))}
        </nav>
        <div className="cr-target__content">
          {tab === 'rules' && <GivePoints doc={doc} update={update} editable rulesOnly onGive={() => {}} />}
          {tab === 'report' && <Report doc={doc} ids={ids} title={title} update={update} />}
          {tab === 'custom' && student && <Customize student={student} update={update} onClose={onClose} />}
        </div>
      </div>
    </Sheet>
  )
}

// ── Pont adása: pozitív / fejlesztendő készségek, szerkeszthetők ──
// ── Ikonválasztó: a csillagra (aktuális ikonra) kattintva nyíló rács ──
const ICON_GROUPS = [
  { label: 'Praise', icons: ['⭐', '🌟', '✨', '👑', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '💎', '🎉', '🎊', '🚀', '🔥', '💯', '👍', '👏', '🙌', '💪', '🤝', '❤️', '😊', '😎'] },
  { label: 'Learning', icons: ['📚', '📖', '📝', '✏️', '🖊️', '📁', '📒', '🎒', '💡', '🧠', '🔍', '🧪', '🔬', '🧩', '🎯', '📈', '🗣️', '💬', '🎤', '🎧', '🌍', '🎓', '🏫', '🗺️'] },
  { label: 'Community', icons: ['🤗', '🫶', '🙋', '👋', '🧹', '🌱', '🌈', '☀️', '🎨', '🎭', '🎵', '⚽', '🧘', '🐢', '🦉', '🐝', '🍀', '🎁'] },
  { label: 'Needs work', icons: ['⚠️', '👎', '⏰', '🕐', '📵', '🔇', '🗑️', '❌', '🚫', '😴', '🙊', '🛸', '🦖', '🐌', '🌧️', '💤'] },
]

// A rács a mezősor alatt nyílik ki (nem lebeg), így a panel görgetése sem vágja le
function IconGrid({ value, onPick }) {
  return (
    <div className="cr-iconpick__pop" role="group" aria-label="Icons">
      {ICON_GROUPS.map((g) => (
        <div key={g.label} className="cr-iconpick__group">
          <span>{g.label}</span>
          <div className="cr-iconpick__grid">
            {g.icons.map((ic) => (
              <button type="button" key={ic} className={ic === value ? 'is-active' : ''} onClick={() => onPick(ic)}>{ic}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Homework review módban: csak „elkészítette / nem készítette el”
// A meglévő készségeket használja (név alapján), ha nincsenek, alapértékkel.
const findSkill = (list, re) => (list || []).find((k) => re.test(k.name))
function HomeworkCheck({ doc, onGive }) {
  const done = findSkill(doc.skills?.positive, /homework done|elkészített házi/i) || { id: 'hw-done', name: 'Homework done', icon: '👍', value: 2 }
  const missing = findSkill(doc.skills?.negative, /no homework|nincs házi/i) || { id: 'hw-missing', name: 'No homework', icon: '🗑️', value: -2 }
  return (
    <div className="cr-hwcheck">
      <p className="cr-hint">Homework review – did they do the homework?</p>
      <div className="cr-hwcheck__row">
        <button className="cr-hwcheck__btn is-done" onClick={() => onGive(done)}>
          <span className="cr-hwcheck__icon" aria-hidden="true">✓</span>
          <b>Homework done</b>
          <small>{done.value > 0 ? `+${done.value}` : done.value} {Math.abs(done.value) === 1 ? 'point' : 'points'}</small>
        </button>
        <button className="cr-hwcheck__btn is-missing" onClick={() => onGive(missing)}>
          <span className="cr-hwcheck__icon" aria-hidden="true">✗</span>
          <b>No homework</b>
          <small>{missing.value} {Math.abs(missing.value) === 1 ? 'point' : 'points'}</small>
        </button>
      </div>
    </div>
  )
}

// A pontszabályok csak az Everyone (egész osztály) menüben szerkeszthetők
function GivePoints({ doc, update, onGive, editable = false, rulesOnly = false }) {
  const [kind, setKind] = useState('positive')
  const [editing, setEditing] = useState(rulesOnly)
  const [form, setForm] = useState(null) // { id?, name, icon, value }
  const [picking, setPicking] = useState(false)
  const list = doc.skills[kind]

  const saveSkill = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const value = kind === 'positive' ? Math.abs(Number(form.value) || 1) : -Math.abs(Number(form.value) || 1)
    const item = { id: form.id || uid(), name: form.name.trim(), icon: form.icon.trim() || (kind === 'positive' ? '⭐' : '⚠️'), value }
    update((d) => ({
      ...d,
      skills: { ...d.skills, [kind]: form.id ? d.skills[kind].map((s) => (s.id === form.id ? item : s)) : [...d.skills[kind], item] },
    }))
    setForm(null)
    setPicking(false)
  }
  const removeSkill = () => {
    update((d) => ({ ...d, skills: { ...d.skills, [kind]: d.skills[kind].filter((s) => s.id !== form.id) } }))
    setForm(null)
  }

  if (form) {
    return (
      <form className="cr-form" onSubmit={saveSkill}>
        <h3>{form.id ? 'Edit skill' : 'New skill'}</h3>
        <div className="cr-form__row">
          <div className="cr-field cr-field--icon">
            <span>Icon</span>
            <button type="button" className="cr-iconpick__btn" onClick={() => setPicking((o) => !o)} aria-expanded={picking} aria-label="Choose icon">
              {form.icon || (kind === 'positive' ? '⭐' : '⚠️')}
            </button>
          </div>
          <label className="cr-field">
            <span>Name</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus maxLength={60} />
          </label>
          <label className="cr-field cr-field--num">
            <span>Points</span>
            <select value={Math.abs(form.value)} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{kind === 'positive' ? `+${n}` : `−${n}`}</option>)}
            </select>
          </label>
        </div>
        {picking && <IconGrid value={form.icon} onPick={(icon) => { setForm({ ...form, icon }); setPicking(false) }} />}
        <div className="cr-form__actions">
          {form.id && <button type="button" className="cr-btn cr-btn--danger" onClick={removeSkill}><Icon.trash />Delete</button>}
          <span className="cr-spacer" />
          <button type="button" className="cr-btn" onClick={() => setForm(null)}>Cancel</button>
          <button type="submit" className="cr-btn cr-btn--primary">Save</button>
        </div>
      </form>
    )
  }

  return (
    <>
      <div className="cr-tabs">
        <button className={kind === 'positive' ? 'is-active' : ''} onClick={() => setKind('positive')}>Positive</button>
        <button className={kind === 'negative' ? 'is-active' : ''} onClick={() => setKind('negative')}>Needs work</button>
        <span className="cr-spacer" />
        {editable && !rulesOnly && (
          <button className={`cr-link ${editing ? 'is-on' : ''}`} onClick={() => setEditing((v) => !v)}>
            <Icon.pencil />{editing ? 'Done' : 'Edit'}
          </button>
        )}
      </div>
      <div className={`cr-skills ${editing ? 'is-editing' : ''}`}>
        {list.map((s) => (
          <button
            key={s.id}
            className="cr-skill"
            onClick={() => (editing ? setForm({ ...s }) : onGive(s))}
          >
            <span className={`cr-skill__val ${s.value < 0 ? 'is-neg' : ''}`}>{s.value > 0 ? `+${s.value}` : s.value}</span>
            <span className="cr-skill__icon" aria-hidden="true">{s.icon}</span>
            <span className="cr-skill__name">{s.name}</span>
            {editing && <span className="cr-skill__edit"><Icon.pencil /></span>}
          </button>
        ))}
        {editable && (
          <button className="cr-skill cr-skill--add" onClick={() => setForm({ name: '', icon: '', value: kind === 'positive' ? 1 : -1 })}>
            <span className="cr-skill__plus"><Icon.plus /></span>
            <span className="cr-skill__name">New skill</span>
          </button>
        )}
      </div>
    </>
  )
}

// ── Pontjelentés: időszak, összesítés, lista, törlés, CSV ──
function Report({ doc, ids, title, update }) {
  const [range, setRange] = useState('week')
  const idSet = useMemo(() => new Set(ids), [ids])
  const bounds = rangeBounds(range)
  const events = doc.events.filter((e) => idSet.has(e.s) && inRange(e.t, bounds)).sort((a, b) => b.t - a.t)
  const pos = events.filter((e) => e.v > 0).reduce((s, e) => s + e.v, 0)
  const neg = events.filter((e) => e.v < 0).reduce((s, e) => s - e.v, 0)
  const pct = pos + neg ? Math.round((pos / (pos + neg)) * 100) : null
  const names = Object.fromEntries(doc.students.map((s) => [s.id, fullName(s)]))
  const multi = ids.length > 1

  // Készségenkénti összesítés
  const bySkill = {}
  for (const e of events) {
    const k = `${e.i} ${e.n}`
    bySkill[k] = bySkill[k] || { icon: e.i, name: e.n, v: 0, n: 0, neg: e.v < 0 }
    bySkill[k].v += e.v
    bySkill[k].n += 1
  }
  const skills = Object.values(bySkill).sort((a, b) => b.n - a.n)

  const exportCsv = () => {
    const rows = [['Date', 'Time', 'Student', 'Skill', 'Points']]
    for (const e of [...events].reverse()) {
      const d = new Date(e.t)
      rows.push([dayKey(d), d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), names[e.s] || '(deleted student)', e.n, e.v])
    }
    const label = RANGES.find((r) => r.id === range)?.label ?? ''
    download(`points – ${title} – ${label}.csv`, toCsv(rows))
  }
  const removeEvent = (id) => update((d) => ({ ...d, events: d.events.filter((e) => e.id !== id) }))

  return (
    <div className="cr-report">
      <div className="cr-report__bar">
        <select value={range} onChange={(e) => setRange(e.target.value)} aria-label="Period">
          {RANGES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
        <span className="cr-spacer" />
        <button className="cr-btn" onClick={exportCsv} disabled={!events.length}><Icon.download />Export (CSV)</button>
      </div>

      {!events.length ? (
        <div className="cr-empty">
          <span className="cr-empty__icon">🏆</span>
          <b>No points in this period</b>
          <p>Choose another period.</p>
        </div>
      ) : (
        <>
          <div className="cr-report__summary">
            <div className="cr-meter" role="img" aria-label={`${pct}% positive`}>
              <span style={{ width: `${pct}%` }} />
            </div>
            <div className="cr-report__nums">
              <span><b className="is-pos">+{pos}</b> positive</span>
              <span><b className="is-neg">−{neg}</b> needs work</span>
              <span><b>{pct}%</b> positive</span>
            </div>
          </div>
          <div className="cr-report__skills">
            {skills.map((s) => (
              <span key={s.icon + s.name} className={`cr-pill ${s.neg ? 'is-neg' : ''}`}>{s.icon} {s.name} <b>×{s.n}</b></span>
            ))}
          </div>
          <ul className="cr-report__list">
            {events.map((e) => {
              const d = new Date(e.t)
              return (
                <li key={e.id}>
                  <span className="cr-report__icon" aria-hidden="true">{e.i}</span>
                  <span className="cr-report__what">
                    <b>{e.n}</b>
                    <small>{multi && `${names[e.s] || '(deleted student)'} · `}{e.sn ? `${e.sn} · ` : ''}{d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', weekday: 'short' })} {d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</small>
                  </span>
                  <span className={`cr-report__val ${e.v < 0 ? 'is-neg' : ''}`}>{e.v > 0 ? `+${e.v}` : e.v}</span>
                  <button className="cr-iconbtn cr-iconbtn--sm" onClick={() => removeEvent(e.id)} aria-label="Undo point" title="Undo"><Icon.close /></button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}

// ── Testreszabás: név, avatar, eltávolítás ──
function Customize({ student, update, onClose }) {
  const [first, setFirst] = useState(student.first)
  const [last, setLast] = useState(student.last)
  const [avatar, setAvatar] = useState(student.avatar)

  const save = (e) => {
    e.preventDefault()
    if (!first.trim()) return
    update((d) => ({ ...d, students: d.students.map((s) => (s.id === student.id ? { ...s, first: first.trim(), last: last.trim(), avatar } : s)) }))
    onClose()
  }
  const remove = () => {
    if (!window.confirm(`Remove ${fullName(student)} from the class? Their points will be deleted too.`)) return
    update((d) => ({
      ...d,
      students: d.students.filter((s) => s.id !== student.id),
      events: d.events.filter((e) => e.s !== student.id),
      groups: d.groups.map((g) => ({ ...g, ids: g.ids.filter((id) => id !== student.id) })),
      avoid: d.avoid.filter(([a, b]) => a !== student.id && b !== student.id),
    }))
    onClose()
  }

  return (
    <form className="cr-form" onSubmit={save}>
      <AvatarEditor value={avatar} onChange={setAvatar} />
      <div className="cr-form__row">
        <label className="cr-field"><span>Surname</span><input value={last} onChange={(e) => setLast(e.target.value)} maxLength={40} /></label>
        <label className="cr-field"><span>First name</span><input value={first} onChange={(e) => setFirst(e.target.value)} maxLength={40} required /></label>
      </div>
      <div className="cr-form__actions">
        <button type="button" className="cr-btn cr-btn--danger" onClick={remove}><Icon.trash />Remove from class</button>
        <span className="cr-spacer" />
        <button type="submit" className="cr-btn cr-btn--primary">Save</button>
      </div>
    </form>
  )
}

const FEATURES = [
  { key: 'b', label: 'Body', list: AVATAR.bodies },
  { key: 'e', label: 'Eyes', list: AVATAR.eyes },
  { key: 'm', label: 'Mouth', list: AVATAR.mouths },
  { key: 'x', label: 'Head', list: AVATAR.extras },
]

export function AvatarEditor({ value, onChange }) {
  const set = (k, v) => onChange({ ...value, [k]: v })
  return (
    <div className="cr-avedit">
      <div className="cr-avedit__preview">
        <Avatar a={value} />
        <button type="button" className="cr-btn cr-btn--sm" onClick={() => onChange(randomAvatar())}><Icon.shuffle />Random</button>
      </div>
      <div className="cr-avedit__opts">
        <div className="cr-avedit__row" role="radiogroup" aria-label="Colour">
          <span>Colour</span>
          {AVATAR.colors.map((c, i) => (
            <button type="button" key={c} role="radio" aria-checked={value.c === i} aria-label={`Colour ${i + 1}`}
              className={`cr-swatch ${value.c === i ? 'is-active' : ''}`} style={{ background: c }} onClick={() => set('c', i)} />
          ))}
        </div>
        {FEATURES.map((f) => (
          <div className="cr-avedit__row" key={f.key} role="radiogroup" aria-label={f.label}>
            <span>{f.label}</span>
            {f.list.map((_, i) => (
              <button type="button" key={i} role="radio" aria-checked={value[f.key] === i}
                className={`cr-avopt ${value[f.key] === i ? 'is-active' : ''}`} onClick={() => set(f.key, i)}>
                <Avatar a={{ ...value, [f.key]: i }} />
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Diákok felvétele (több név egyszerre) ──
export function AddStudents({ update, onClose }) {
  const [text, setText] = useState('')
  const parsed = text.split(/\r?\n/).map(parseName).filter(Boolean)
  const submit = (e) => {
    e.preventDefault()
    if (!parsed.length) return
    update((d) => ({ ...d, students: [...d.students, ...parsed.map((p) => ({ id: uid(), ...p, avatar: randomAvatar() }))] }))
    onClose()
  }
  return (
    <Sheet title="Add students" onClose={onClose}>
      <form className="cr-form" onSubmit={submit}>
        <label className="cr-field">
          <span>One name per line (Surname First name)</span>
          <textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder={'Kovács Anna\nNagy Bence\nSzabó L. Dóra'} autoFocus />
        </label>
        <p className="cr-hint">Data minimisation: a first name and surname initial is enough (e.g. “K. Anna”). Data is encrypted and only accessible with the teacher password.</p>
        <div className="cr-form__actions">
          <span className="cr-muted">{parsed.length ? `${parsed.length} student${parsed.length === 1 ? '' : 's'}` : ''}</span>
          <span className="cr-spacer" />
          <button type="button" className="cr-btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="cr-btn cr-btn--primary" disabled={!parsed.length}>Add</button>
        </div>
      </form>
    </Sheet>
  )
}

// ── Csoport szerkesztése ──
export function GroupEditor({ doc, group, update, onClose }) {
  const todays = doc.groupsDate === dayKey() ? doc.groups : []
  const [name, setName] = useState(group?.name ?? `Group ${todays.length + 1}`)
  const [ids, setIds] = useState(new Set(group?.ids ?? []))
  const toggle = (id) => setIds((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const save = (e) => {
    e.preventDefault()
    const item = { id: group?.id ?? uid(), name: name.trim() || 'Group', ids: [...ids] }
    // a csoportok mindig a mai napra szólnak: régi napi beosztásból újat kezdünk
    update((d) => {
      const base = d.groupsDate === dayKey() ? d.groups : []
      return { ...d, groupsDate: dayKey(), groups: group ? base.map((g) => (g.id === group.id ? item : g)) : [...base, item] }
    })
    onClose()
  }
  const remove = () => {
    update((d) => ({ ...d, groups: d.groups.filter((g) => g.id !== group.id) }))
    onClose()
  }
  return (
    <Sheet title={group ? 'Edit group' : 'New group'} onClose={onClose}>
      <form className="cr-form" onSubmit={save}>
        <label className="cr-field"><span>Group name</span><input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoFocus /></label>
        <div className="cr-pickgrid">
          {sortStudents(doc.students).map((s) => (
            <button type="button" key={s.id} className={`cr-pick ${ids.has(s.id) ? 'is-active' : ''}`} onClick={() => toggle(s.id)} aria-pressed={ids.has(s.id)}>
              <Avatar a={s.avatar} /><span>{pickName(s, doc.students)}</span>
            </button>
          ))}
        </div>
        <div className="cr-form__actions">
          {group && <button type="button" className="cr-btn cr-btn--danger" onClick={remove}><Icon.trash />Delete</button>}
          <span className="cr-spacer" />
          <button type="button" className="cr-btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="cr-btn cr-btn--primary">Save</button>
        </div>
      </form>
    </Sheet>
  )
}

// ── Házi feladat ellenőrzése (Homework review) – két lépésben ──
// 1. Kik csinálták meg? (mindenki / bizonyos diákok)  2. A többiek nem – kivéve, akit felmentesz.
export function HomeworkWizard({ doc, presentIds, preselect = [], onSave, onClose }) {
  const present = sortStudents(doc.students.filter((s) => presentIds.includes(s.id)))
  const absentees = sortStudents(doc.students.filter((s) => !presentIds.includes(s.id)))
  const AbsentCards = () => absentees.map((s) => (
    <span key={s.id} className="cr-pick is-absentee" aria-label={`${pickName(s, doc.students)} – absent`}>
      <Avatar a={s.avatar} /><span>{pickName(s, doc.students)}</span><i className="cr-pick__mark is-abs">absent</i>
    </span>
  ))
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(() => new Set(preselect))
  const [excused, setExcused] = useState(() => new Set())
  const rest = present.filter((s) => !done.has(s.id))
  const missing = rest.filter((s) => !excused.has(s.id))
  const toggle = (_set, setter, id) => setter((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const doneSkill = findSkill(doc.skills?.positive, /homework done|elkészített házi/i) || { id: 'hw-done', name: 'Homework done', icon: '👍', value: 2 }
  const missSkill = findSkill(doc.skills?.negative, /no homework|nincs házi/i) || { id: 'hw-missing', name: 'No homework', icon: '🗑️', value: -2 }

  return (
    <Sheet title="Check homework" onClose={onClose} className="cr-hwwiz">
      <ol className="cr-hwwiz__steps">
        <li className={step === 1 ? 'is-current' : 'is-done'}>1. Who did it?</li>
        <li className={step === 2 ? 'is-current' : ''}>2. Who didn't?</li>
      </ol>

      {step === 1 ? (
        <>
          <p className="cr-hwwiz__q">Who did their homework?</p>
          <div className="cr-hwwiz__quick">
            <button className="cr-btn cr-btn--sm" onClick={() => setDone(new Set(present.map((s) => s.id)))}>Everyone</button>
            <button className="cr-btn cr-btn--sm" onClick={() => setDone(new Set())}>Nobody</button>
            <span className="cr-muted">{done.size} / {present.length} selected</span>
          </div>
          <div className="cr-pickgrid">
            {present.map((s) => (
              <button type="button" key={s.id} className={`cr-pick ${done.has(s.id) ? 'is-active is-yes' : ''}`} onClick={() => toggle(done, setDone, s.id)} aria-pressed={done.has(s.id)}>
                <Avatar a={s.avatar} /><span>{pickName(s, doc.students)}</span>
                {done.has(s.id) && <i className="cr-pick__mark is-yes">✓</i>}
              </button>
            ))}
            <AbsentCards />
          </div>
          <div className="cr-form__actions">
            <span className="cr-spacer" />
            <button className="cr-btn" onClick={onClose}>Cancel</button>
            <button className="cr-btn cr-btn--primary" onClick={() => (rest.length ? setStep(2) : onSave([...done], []))}>
              {rest.length ? 'Next' : 'Save'}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="cr-hwwiz__q">So these students didn't do it?</p>
          <div className="cr-pickgrid">
            {rest.map((s) => {
              const ex = excused.has(s.id)
              return (
                <button type="button" key={s.id} className={`cr-pick ${ex ? 'is-excused' : 'is-active is-no'}`} onClick={() => toggle(excused, setExcused, s.id)} aria-pressed={!ex}>
                  <Avatar a={s.avatar} /><span>{pickName(s, doc.students)}</span>
                  <i className={`cr-pick__mark ${ex ? 'is-ex' : 'is-no'}`}>{ex ? 'excused' : '✗'}</i>
                </button>
              )
            })}
            <AbsentCards />
          </div>
          <p className="cr-hwwiz__sum">
            <span className="is-yes">✓ {done.size} done</span>
            <span className="is-no">✗ {missing.length} no homework</span>
            {excused.size > 0 && <span>{excused.size} excused</span>}
            {absentees.length > 0 && <span>{absentees.length} absent</span>}
          </p>
          <div className="cr-form__actions">
            <button className="cr-btn" onClick={() => setStep(1)}>Back</button>
            <span className="cr-spacer" />
            <button className="cr-btn cr-btn--primary" onClick={() => onSave([...done], missing.map((s) => s.id), doneSkill, missSkill)}>Save</button>
          </div>
        </>
      )}
    </Sheet>
  )
}

// ── Jelenlét (Attendance) – két lépésben, mint a házi-ellenőrzés ──
// 1. Ki van itt?  2. A többiek hiányoznak – akire rákattintasz, az késett (late).
export function AttendanceWizard({ doc, date, preselect = null, onSave, onClose }) {
  const all = sortStudents(doc.students)
  const prev = doc.attendance?.[date] || {}
  const hasPrev = Object.keys(prev).length > 0
  const [step, setStep] = useState(1)
  // 1. lépés: aki végig itt volt; 2. lépés: a többiek állapota – hiányzik / késett / korábban távozott
  const [here, setHere] = useState(() => new Set(preselect?.length ? preselect
    : hasPrev ? all.filter((s) => prev[s.id] === 'present').map((s) => s.id) : all.map((s) => s.id)))
  const [status, setStatus] = useState(() => Object.fromEntries(all.filter((s) => ['late', 'left'].includes(prev[s.id])).map((s) => [s.id, prev[s.id]])))
  const rest = all.filter((s) => !here.has(s.id))
  const toggle = (setter, id) => setter((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  const stOf = (id) => status[id] || 'absent'
  const save = () => {
    const map = {}
    for (const s of all) map[s.id] = here.has(s.id) ? 'present' : stOf(s.id)
    onSave(map)
  }
  const count = (st) => rest.filter((s) => stOf(s.id) === st).length
  const absentN = count('absent')
  const lateN = count('late')
  const leftN = count('left')

  return (
    <Sheet title="Take attendance" onClose={onClose} className="cr-hwwiz">
      <ol className="cr-hwwiz__steps">
        <li className={step === 1 ? 'is-current' : 'is-done'}>1. Who's here?</li>
        <li className={step === 2 ? 'is-current' : ''}>2. Absent / late / left</li>
      </ol>
      {step === 1 ? (
        <>
          <p className="cr-hwwiz__q">Who's here?</p>
          <div className="cr-hwwiz__quick">
            <button className="cr-btn cr-btn--sm" onClick={() => setHere(new Set(all.map((s) => s.id)))}>Everyone</button>
            <button className="cr-btn cr-btn--sm" onClick={() => setHere(new Set())}>Nobody</button>
            <span className="cr-muted">{here.size} / {all.length} here</span>
          </div>
          <div className="cr-pickgrid">
            {all.map((s) => (
              <button type="button" key={s.id} className={`cr-pick ${here.has(s.id) ? 'is-active is-yes' : ''}`} onClick={() => toggle(setHere, s.id)} aria-pressed={here.has(s.id)}>
                <Avatar a={s.avatar} /><span>{pickName(s, doc.students)}</span>
                {here.has(s.id) && <i className="cr-pick__mark is-yes">✓</i>}
              </button>
            ))}
          </div>
          <div className="cr-form__actions">
            <span className="cr-spacer" />
            <button className="cr-btn" onClick={onClose}>Cancel</button>
            <button className="cr-btn cr-btn--primary" onClick={() => (rest.length ? setStep(2) : save())}>{rest.length ? 'Next' : 'Save'}</button>
          </div>
        </>
      ) : (
        <>
          <p className="cr-hwwiz__q">What about these students?</p>
          <div className="cr-attlist">
            {rest.map((s) => {
              const st = stOf(s.id)
              return (
                <div key={s.id} className={`cr-attrow is-${st}`}>
                  <Avatar a={s.avatar} />
                  <b>{pickName(s, doc.students)}</b>
                  <div className="cr-attrow__seg" role="radiogroup" aria-label={pickName(s, doc.students)}>
                    {[['absent', 'Absent'], ['late', 'Late'], ['left', 'Left early']].map(([v, l]) => (
                      <button key={v} role="radio" aria-checked={st === v} className={st === v ? `is-on is-${v}` : ''}
                        onClick={() => setStatus((x) => ({ ...x, [s.id]: v }))}>{l}</button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <p className="cr-hwwiz__sum">
            <span className="is-yes">✓ {here.size} here</span>
            <span className="is-no">✗ {absentN} absent</span>
            {lateN > 0 && <span className="is-late">{lateN} late</span>}
            {leftN > 0 && <span className="is-late">{leftN} left early</span>}
          </p>
          <div className="cr-form__actions">
            <button className="cr-btn" onClick={() => setStep(1)}>Back</button>
            <span className="cr-spacer" />
            <button className="cr-btn cr-btn--primary" onClick={save}>Save</button>
          </div>
        </>
      )}
    </Sheet>
  )
}

// ── Pontadás egy lépéshez – két lépésben (mint a jelenlét és a házi) ──
// 1. Mi­ért? (a lépéshez megadott pontok)  2. Ki kapja? (a hiányzók halványan, nem választhatók)
export function PointsWizard({ doc, skills, stepTitle, presentIds, preselect = [], onSave, onClose }) {
  const [skill, setSkill] = useState(skills.length === 1 ? skills[0] : null)
  const [who, setWho] = useState(() => new Set(preselect.filter((id) => presentIds.includes(id))))
  const present = sortStudents(doc.students.filter((s) => presentIds.includes(s.id)))
  const absentees = sortStudents(doc.students.filter((s) => !presentIds.includes(s.id)))
  const toggle = (id) => setWho((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  const pos = skills.filter((k) => k.value > 0)
  const neg = skills.filter((k) => k.value < 0)

  return (
    <Sheet title="Give points" onClose={onClose} className="cr-hwwiz cr-ptwiz">
      <p className="cr-ptwiz__step">{stepTitle}</p>
      <ol className="cr-hwwiz__steps">
        <li className={!skill ? 'is-current' : 'is-done'}>1. What for?</li>
        <li className={skill ? 'is-current' : ''}>2. Who?</li>
      </ol>
      {!skill ? (
        <>
          <p className="cr-hwwiz__q">What for?</p>
          <div className="cr-skills cr-skills--sm">
            {[...pos, ...neg].map((k) => (
              <button key={k.id} className="cr-skill" onClick={() => setSkill(k)}>
                <span className={`cr-skill__val ${k.value < 0 ? 'is-neg' : ''}`}>{k.value > 0 ? `+${k.value}` : k.value}</span>
                <span className="cr-skill__icon" aria-hidden="true">{k.icon}</span>
                <span className="cr-skill__name">{k.name}</span>
              </button>
            ))}
          </div>
          <div className="cr-form__actions"><span className="cr-spacer" /><button className="cr-btn" onClick={onClose}>Cancel</button></div>
        </>
      ) : (
        <>
          <p className="cr-hwwiz__q"><span aria-hidden="true">{skill.icon}</span> {skill.name} <b className={skill.value < 0 ? 'is-neg' : 'is-pos'}>{skill.value > 0 ? `+${skill.value}` : skill.value}</b> – who?</p>
          <div className="cr-hwwiz__quick">
            <button className="cr-btn cr-btn--sm" onClick={() => setWho(new Set(present.map((s) => s.id)))}>Everyone</button>
            <button className="cr-btn cr-btn--sm" onClick={() => setWho(new Set())}>Nobody</button>
            <span className="cr-muted">{who.size} / {present.length} selected</span>
          </div>
          <div className="cr-pickgrid">
            {present.map((s) => (
              <button type="button" key={s.id} className={`cr-pick ${who.has(s.id) ? `is-active ${skill.value < 0 ? 'is-no' : 'is-yes'}` : ''}`} onClick={() => toggle(s.id)} aria-pressed={who.has(s.id)}>
                <Avatar a={s.avatar} /><span>{pickName(s, doc.students)}</span>
                {who.has(s.id) && <i className={`cr-pick__mark ${skill.value < 0 ? 'is-no' : 'is-yes'}`}>{skill.value > 0 ? `+${skill.value}` : skill.value}</i>}
              </button>
            ))}
            {absentees.map((s) => (
              <span key={s.id} className="cr-pick is-absentee"><Avatar a={s.avatar} /><span>{pickName(s, doc.students)}</span><i className="cr-pick__mark is-abs">absent</i></span>
            ))}
          </div>
          <div className="cr-form__actions">
            {skills.length > 1 && <button className="cr-btn" onClick={() => setSkill(null)}>Back</button>}
            <span className="cr-spacer" />
            <button className="cr-btn cr-btn--primary" disabled={!who.size} onClick={() => onSave(skill, [...who])}>Save</button>
          </div>
        </>
      )}
    </Sheet>
  )
}
