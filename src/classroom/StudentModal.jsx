import { useMemo, useState } from 'react'
import Avatar, { ClassAvatar } from './Avatar.jsx'
import { Sheet, Icon } from './ui.jsx'
import {
  AVATAR, RANGES, rangeBounds, inRange, fullName, uid, parseName, randomAvatar, toCsv, download, dayKey,
} from './model.js'

/*
  Diák / egész osztály / kijelölt diákok paneljei.
  target: { type: 'student', id } | { type: 'class' } | { type: 'multi', ids, title }
*/
export function TargetModal({ doc, target, points, onAward, update, onClose, initialTab = 'give' }) {
  const student = target.type === 'student' ? doc.students.find((s) => s.id === target.id) : null
  const [tab, setTab] = useState(initialTab)
  if (target.type === 'student' && !student) return null

  const ids = target.type === 'student' ? [student.id] : target.type === 'multi' ? target.ids : doc.students.map((s) => s.id)
  const total = target.type === 'student'
    ? points[student.id] || 0
    : ids.reduce((sum, id) => sum + (points[id] || 0), 0)
  const title = student ? fullName(student) : target.type === 'class' ? 'Egész osztály' : target.title

  const tabs = [
    { id: 'give', label: 'Pont adása', icon: <Icon.plus /> },
    { id: 'report', label: 'Pontjelentés', icon: <Icon.list /> },
    ...(student ? [{ id: 'custom', label: 'Testreszabás', icon: <Icon.pencil /> }] : []),
  ]

  return (
    <Sheet onClose={onClose} wide className="cr-target">
      <header className="cr-target__head">
        <span className="cr-target__avatar">{student ? <Avatar a={student.avatar} /> : <ClassAvatar />}</span>
        <h2>{title}</h2>
        <span className={`cr-chip ${total < 0 ? 'cr-chip--neg' : ''}`}><b>{total}</b> pont</span>
        {target.type === 'multi' && <span className="cr-chip cr-chip--muted">{ids.length} diák</span>}
      </header>
      <div className="cr-target__layout">
        <nav className="cr-target__nav" aria-label="Menü">
          {tabs.map((t) => (
            <button key={t.id} className={`cr-navbtn ${tab === t.id ? 'is-active' : ''}`} onClick={() => setTab(t.id)}>
              {t.icon}{t.label}
            </button>
          ))}
        </nav>
        <div className="cr-target__content">
          {tab === 'give' && <GivePoints doc={doc} update={update} onGive={(sk) => { onAward(ids, sk, title); onClose() }} />}
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
  { label: 'Dicséret', icons: ['⭐', '🌟', '✨', '👑', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '💎', '🎉', '🎊', '🚀', '🔥', '💯', '👍', '👏', '🙌', '💪', '🤝', '❤️', '😊', '😎'] },
  { label: 'Tanulás', icons: ['📚', '📖', '📝', '✏️', '🖊️', '📁', '📒', '🎒', '💡', '🧠', '🔍', '🧪', '🔬', '🧩', '🎯', '📈', '🗣️', '💬', '🎤', '🎧', '🌍', '🎓', '🏫', '🗺️'] },
  { label: 'Közösség', icons: ['🤗', '🫶', '🙋', '👋', '🧹', '🌱', '🌈', '☀️', '🎨', '🎭', '🎵', '⚽', '🧘', '🐢', '🦉', '🐝', '🍀', '🎁'] },
  { label: 'Fejlesztendő', icons: ['⚠️', '👎', '⏰', '🕐', '📵', '🔇', '🗑️', '❌', '🚫', '😴', '🙊', '🛸', '🦖', '🐌', '🌧️', '💤'] },
]

// A rács a mezősor alatt nyílik ki (nem lebeg), így a panel görgetése sem vágja le
function IconGrid({ value, onPick }) {
  return (
    <div className="cr-iconpick__pop" role="group" aria-label="Ikonok">
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

function GivePoints({ doc, update, onGive }) {
  const [kind, setKind] = useState('positive')
  const [editing, setEditing] = useState(false)
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
        <h3>{form.id ? 'Készség szerkesztése' : 'Új készség'}</h3>
        <div className="cr-form__row">
          <div className="cr-field cr-field--icon">
            <span>Ikon</span>
            <button type="button" className="cr-iconpick__btn" onClick={() => setPicking((o) => !o)} aria-expanded={picking} aria-label="Ikon kiválasztása">
              {form.icon || (kind === 'positive' ? '⭐' : '⚠️')}
            </button>
          </div>
          <label className="cr-field">
            <span>Megnevezés</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus maxLength={60} />
          </label>
          <label className="cr-field cr-field--num">
            <span>Pont</span>
            <select value={Math.abs(form.value)} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{kind === 'positive' ? `+${n}` : `−${n}`}</option>)}
            </select>
          </label>
        </div>
        {picking && <IconGrid value={form.icon} onPick={(icon) => { setForm({ ...form, icon }); setPicking(false) }} />}
        <div className="cr-form__actions">
          {form.id && <button type="button" className="cr-btn cr-btn--danger" onClick={removeSkill}><Icon.trash />Törlés</button>}
          <span className="cr-spacer" />
          <button type="button" className="cr-btn" onClick={() => setForm(null)}>Mégse</button>
          <button type="submit" className="cr-btn cr-btn--primary">Mentés</button>
        </div>
      </form>
    )
  }

  return (
    <>
      <div className="cr-tabs">
        <button className={kind === 'positive' ? 'is-active' : ''} onClick={() => setKind('positive')}>Pozitív</button>
        <button className={kind === 'negative' ? 'is-active' : ''} onClick={() => setKind('negative')}>Fejlesztendő</button>
        <span className="cr-spacer" />
        <button className={`cr-link ${editing ? 'is-on' : ''}`} onClick={() => setEditing((v) => !v)}>
          <Icon.pencil />{editing ? 'Kész' : 'Szerkesztés'}
        </button>
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
        <button className="cr-skill cr-skill--add" onClick={() => setForm({ name: '', icon: '', value: kind === 'positive' ? 1 : -1 })}>
          <span className="cr-skill__plus"><Icon.plus /></span>
          <span className="cr-skill__name">Új készség</span>
        </button>
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
    const rows = [['Dátum', 'Idő', 'Diák', 'Készség', 'Pont']]
    for (const e of [...events].reverse()) {
      const d = new Date(e.t)
      rows.push([dayKey(d), d.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }), names[e.s] || '(törölt diák)', e.n, e.v])
    }
    const label = RANGES.find((r) => r.id === range)?.label ?? ''
    download(`pontok – ${title} – ${label}.csv`, toCsv(rows))
  }
  const removeEvent = (id) => update((d) => ({ ...d, events: d.events.filter((e) => e.id !== id) }))

  return (
    <div className="cr-report">
      <div className="cr-report__bar">
        <select value={range} onChange={(e) => setRange(e.target.value)} aria-label="Időszak">
          {RANGES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
        <span className="cr-spacer" />
        <button className="cr-btn" onClick={exportCsv} disabled={!events.length}><Icon.download />Export (CSV)</button>
      </div>

      {!events.length ? (
        <div className="cr-empty">
          <span className="cr-empty__icon">🏆</span>
          <b>Nincs pont ebben az időszakban</b>
          <p>Válassz másik időszakot.</p>
        </div>
      ) : (
        <>
          <div className="cr-report__summary">
            <div className="cr-meter" role="img" aria-label={`${pct}% pozitív`}>
              <span style={{ width: `${pct}%` }} />
            </div>
            <div className="cr-report__nums">
              <span><b className="is-pos">+{pos}</b> pozitív</span>
              <span><b className="is-neg">−{neg}</b> fejlesztendő</span>
              <span><b>{pct}%</b> pozitív arány</span>
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
                    <small>{multi && `${names[e.s] || '(törölt diák)'} · `}{d.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric', weekday: 'short' })} {d.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}</small>
                  </span>
                  <span className={`cr-report__val ${e.v < 0 ? 'is-neg' : ''}`}>{e.v > 0 ? `+${e.v}` : e.v}</span>
                  <button className="cr-iconbtn cr-iconbtn--sm" onClick={() => removeEvent(e.id)} aria-label="Pont visszavonása" title="Visszavonás"><Icon.close /></button>
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
    if (!window.confirm(`Biztosan eltávolítod ${fullName(student)} diákot az osztályból? A pontjai is törlődnek.`)) return
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
        <label className="cr-field"><span>Vezetéknév</span><input value={last} onChange={(e) => setLast(e.target.value)} maxLength={40} /></label>
        <label className="cr-field"><span>Keresztnév</span><input value={first} onChange={(e) => setFirst(e.target.value)} maxLength={40} required /></label>
      </div>
      <div className="cr-form__actions">
        <button type="button" className="cr-btn cr-btn--danger" onClick={remove}><Icon.trash />Eltávolítás az osztályból</button>
        <span className="cr-spacer" />
        <button type="submit" className="cr-btn cr-btn--primary">Mentés</button>
      </div>
    </form>
  )
}

const FEATURES = [
  { key: 'b', label: 'Test', list: AVATAR.bodies },
  { key: 'e', label: 'Szem', list: AVATAR.eyes },
  { key: 'm', label: 'Száj', list: AVATAR.mouths },
  { key: 'x', label: 'Fej', list: AVATAR.extras },
]

export function AvatarEditor({ value, onChange }) {
  const set = (k, v) => onChange({ ...value, [k]: v })
  return (
    <div className="cr-avedit">
      <div className="cr-avedit__preview">
        <Avatar a={value} />
        <button type="button" className="cr-btn cr-btn--sm" onClick={() => onChange(randomAvatar())}><Icon.shuffle />Véletlen</button>
      </div>
      <div className="cr-avedit__opts">
        <div className="cr-avedit__row" role="radiogroup" aria-label="Szín">
          <span>Szín</span>
          {AVATAR.colors.map((c, i) => (
            <button type="button" key={c} role="radio" aria-checked={value.c === i} aria-label={`${i + 1}. szín`}
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
    <Sheet title="Diákok felvétele" onClose={onClose}>
      <form className="cr-form" onSubmit={submit}>
        <label className="cr-field">
          <span>Soronként egy név (Vezetéknév Keresztnév)</span>
          <textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder={'Kovács Anna\nNagy Bence\nSzabó L. Dóra'} autoFocus />
        </label>
        <p className="cr-hint">Adattakarékosság: elég a keresztnév és a vezetéknév kezdőbetűje is (pl. „K. Anna”). Az adatok titkosítva, csak a tanári jelszóval érhetők el.</p>
        <div className="cr-form__actions">
          <span className="cr-muted">{parsed.length ? `${parsed.length} diák` : ''}</span>
          <span className="cr-spacer" />
          <button type="button" className="cr-btn" onClick={onClose}>Mégse</button>
          <button type="submit" className="cr-btn cr-btn--primary" disabled={!parsed.length}>Felvétel</button>
        </div>
      </form>
    </Sheet>
  )
}

// ── Csoport szerkesztése ──
export function GroupEditor({ doc, group, update, onClose }) {
  const [name, setName] = useState(group?.name ?? `${doc.groups.length + 1}. csoport`)
  const [ids, setIds] = useState(new Set(group?.ids ?? []))
  const toggle = (id) => setIds((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const save = (e) => {
    e.preventDefault()
    const item = { id: group?.id ?? uid(), name: name.trim() || 'Csoport', ids: [...ids] }
    update((d) => ({ ...d, groups: group ? d.groups.map((g) => (g.id === group.id ? item : g)) : [...d.groups, item] }))
    onClose()
  }
  const remove = () => {
    update((d) => ({ ...d, groups: d.groups.filter((g) => g.id !== group.id) }))
    onClose()
  }
  return (
    <Sheet title={group ? 'Csoport szerkesztése' : 'Új csoport'} onClose={onClose}>
      <form className="cr-form" onSubmit={save}>
        <label className="cr-field"><span>Csoport neve</span><input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoFocus /></label>
        <div className="cr-pickgrid">
          {doc.students.map((s) => (
            <button type="button" key={s.id} className={`cr-pick ${ids.has(s.id) ? 'is-active' : ''}`} onClick={() => toggle(s.id)} aria-pressed={ids.has(s.id)}>
              <Avatar a={s.avatar} /><span>{s.first}</span>
            </button>
          ))}
        </div>
        <div className="cr-form__actions">
          {group && <button type="button" className="cr-btn cr-btn--danger" onClick={remove}><Icon.trash />Törlés</button>}
          <span className="cr-spacer" />
          <button type="button" className="cr-btn" onClick={onClose}>Mégse</button>
          <button type="submit" className="cr-btn cr-btn--primary">Mentés</button>
        </div>
      </form>
    </Sheet>
  )
}
