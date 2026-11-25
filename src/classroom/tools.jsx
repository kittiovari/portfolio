import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Avatar from './Avatar.jsx'
import { Sheet, FullScreen, Icon, play } from './ui.jsx'
import { dayKey, fmtTime, isAbsent, makeGroups, shortName, shuffle, sortStudents, uid } from './model.js'

export const TOOLS = [
  { id: 'session', label: 'Timer & music', color: '#6A4BC4', icon: Icon.timer },
  { id: 'random', label: 'Random student', color: '#3F7D4E', icon: Icon.shuffle },
  { id: 'groups', label: 'Group maker', color: '#B4443B', icon: Icon.people },
  { id: 'directions', label: 'Directions', color: '#2F6F73', icon: Icon.list },
  { id: 'tps', label: 'Think – Pair – Share', color: '#8A4FA0', icon: Icon.bubbles },
  { id: 'today', label: 'Lesson plan', color: '#E0B33A', icon: Icon.sun, dark: true },
]
const tool = (id) => TOOLS.find((t) => t.id === id)

// ── Eszköztár ──
export function Toolkit({ onPick, onClose }) {
  return (
    <Sheet title="Toolkit" onClose={onClose} wide>
      <div className="cr-toolkit">
        {TOOLS.map((t) => (
          <button key={t.id} className="cr-tool" onClick={() => onPick(t.id)}>
            <span className="cr-tool__icon" style={{ background: t.color, color: t.dark ? '#241422' : '#fff' }}><t.icon /></span>
            <span className="cr-tool__label">{t.label}</span>
          </button>
        ))}
      </div>
    </Sheet>
  )
}

// Visszaszámláló: endAt-hez mérve (a böngésző altatásakor sem csúszik el)
export function useCountdown(initial, onDone) {
  const [left, setLeft] = useState(initial)
  const [running, setRunning] = useState(initial > 0)
  const endAt = useRef(Date.now() + initial * 1000)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    if (!running) return
    endAt.current = Date.now() + left * 1000
    const id = setInterval(() => {
      const s = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000))
      setLeft(s)
      if (s <= 0) { setRunning(false); doneRef.current?.() }
    }, 200)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  return {
    left,
    running,
    toggle: () => setRunning((r) => (left > 0 ? !r : r)),
    reset: (s = initial) => { setRunning(false); setLeft(s) },
    add: (s) => {
      setLeft((l) => l + s)
      endAt.current += s * 1000
      if (!running) setRunning(true)
    },
    restart: (s) => { setLeft(s); setRunning(false); setTimeout(() => setRunning(true), 0) },
  }
}

// ── Véletlen diák ──
export function RandomTool({ doc, onClose, onGive }) {
  const t = tool('random')
  const pool = doc.students.filter((s) => !isAbsent(doc, s.id))
  const noRepeat = true // ismétlés nélkül, amíg mindenki sorra nem kerül
  const [used, setUsed] = useState(() => new Set())
  const [shown, setShown] = useState(null)
  const [rolling, setRolling] = useState(false)

  const roll = () => {
    let candidates = noRepeat ? pool.filter((s) => !used.has(s.id)) : pool
    if (!candidates.length) { candidates = pool; setUsed(new Set()) }
    if (!candidates.length) return
    const winner = candidates[Math.floor(Math.random() * candidates.length)]
    setRolling(true)
    let i = 0
    const id = setInterval(() => {
      setShown(pool[Math.floor(Math.random() * pool.length)])
      play('tick')
      if (++i >= 12) {
        clearInterval(id)
        setShown(winner)
        setRolling(false)
        setUsed((u) => new Set(u).add(winner.id))
        play('pick')
      }
    }, 75)
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { roll() }, [])

  if (!pool.length) {
    return <Sheet title={t.label} color={t.color} icon={<t.icon />} onClose={onClose}><p className="cr-hint">There are no (present) students in this class yet.</p></Sheet>
  }
  return (
    <FullScreen color={t.color} onClose={onClose}>
      <p className="cr-full__kicker">And the lucky one is:</p>
      <div className={`cr-pickcard ${rolling ? 'is-rolling' : ''}`}>
        {shown && (
          <>
            <Avatar a={shown.avatar} />
            <b>{shortName(shown)}</b>
          </>
        )}
      </div>
      <div className="cr-controls cr-controls--pills">
        <button className="cr-pillbtn" onClick={roll} disabled={rolling}><Icon.shuffle />Again</button>
        {shown && !rolling && <button className="cr-pillbtn" onClick={() => onGive(shown.id)}><Icon.plus />Give points</button>}
      </div>
    </FullScreen>
  )
}

// ── Csoportkészítő ──
export function GroupMakerTool({ doc, update, onClose, onBack, initialSize = null, date = undefined }) {
  const t = tool('groups')
  // az adott óra jelenléte szerint (a kártyáról indítva), különben a mai nap szerint
  const present = doc.students.filter((s) => !isAbsent(doc, s.id, date))
  const [view, setView] = useState('size') // size | avoid | result
  const [size, setSize] = useState(3)
  const [groups, setGroups] = useState(null)
  const byId = useMemo(() => Object.fromEntries(doc.students.map((s) => [s.id, s])), [doc.students])

  const [keepAlone, setKeepAlone] = useState(false)
  const make = (n) => {
    setKeepAlone(false)
    setSize(n)
    setGroups(makeGroups(present.map((s) => s.id), n, doc.avoid))
    setView('result')
  }
  // párokhoz rögtön sorsol (a kártyáról indítva)
  useEffect(() => { if (initialSize && present.length > 1) make(initialSize) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const saveAsGroups = () => {
    if (doc.groups.length && !window.confirm('Replace the existing groups with the new ones?')) return
    update((d) => ({ ...d, groups: groups.map((ids, i) => ({ id: uid(), name: `${size === 2 ? 'Pair' : 'Group'} ${i + 1}`, ids })) }))
    onClose()
  }

  if (view === 'result' && groups) {
    // egyedül maradt diák: a tanár választja ki, hová kerüljön (vagy maradjon egyedül)
    const loneIdx = size > 1 && !keepAlone ? groups.findIndex((g) => g.length === 1) : -1
    const lone = loneIdx >= 0 ? byId[groups[loneIdx][0]] : null
    const label = (i) => `${size === 2 ? 'Pair' : 'Group'} ${i + 1}`
    const addTo = (target) => setGroups((gs) => {
      const id = gs[loneIdx][0]
      return gs.map((g, i) => (i === target ? [...g, id] : g)).filter((_, i) => i !== loneIdx)
    })
    return (
      <FullScreen color={t.color} onClose={onClose}>
        {lone && (
          <div className="cr-lone">
            <span className="cr-lone__who"><Avatar a={lone.avatar} /><b>{shortName(lone)}</b> is on their own – add to:</span>
            <span className="cr-lone__opts">
              {groups.map((g, i) => i !== loneIdx && (
                <button key={i} className="cr-pillbtn cr-pillbtn--sm" onClick={() => addTo(i)}>{label(i)}</button>
              ))}
              <button className="cr-pillbtn cr-pillbtn--sm cr-lone__keep" onClick={() => setKeepAlone(true)}>Keep alone</button>
            </span>
          </div>
        )}
        <div className="cr-groupres">
          {groups.map((g, i) => (
            <motion.div key={i} className="cr-groupres__card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <h3>{size === 2 ? 'Pair' : 'Group'} {i + 1}</h3>
              {g.map((id) => byId[id] && (
                <div key={id} className="cr-groupres__row"><Avatar a={byId[id].avatar} /><span>{shortName(byId[id])}</span></div>
              ))}
            </motion.div>
          ))}
        </div>
        <div className="cr-controls cr-controls--pills">
          <button className="cr-pillbtn" onClick={() => make(size)}><Icon.shuffle />Reshuffle</button>
          <button className="cr-pillbtn" onClick={saveAsGroups}><Icon.check />Save as groups</button>
          <button className="cr-pillbtn" onClick={() => setView('size')}><Icon.back />Group size</button>
        </div>
      </FullScreen>
    )
  }

  if (view === 'avoid') return <AvoidPairs doc={doc} update={update} color={t.color} onBack={() => setView('size')} onClose={onClose} />

  return (
    <Sheet title={t.label} color={t.color} icon={<t.icon />} onClose={onClose} onBack={onBack}>
      <h3 className="cr-q">How many students per group?</h3>
      <div className="cr-presets">
        {[2, 3, 4, 5, 6].map((n) => <button key={n} className="cr-preset" onClick={() => make(n)} disabled={present.length < 2}>{n}</button>)}
      </div>
      <p className="cr-hint">{present.length} student{present.length === 1 ? '' : 's'} present{doc.avoid.length ? ` · ${doc.avoid.length} pair${doc.avoid.length === 1 ? '' : 's'} kept apart` : ''}</p>
      <button className="cr-link cr-link--center" onClick={() => setView('avoid')}>Keep apart <Icon.next /></button>
    </Sheet>
  )
}

function AvoidPairs({ doc, update, color, onBack, onClose }) {
  const [sel, setSel] = useState([])
  const byId = Object.fromEntries(doc.students.map((s) => [s.id, s]))
  const choose = (id) => {
    const next = sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id].slice(-2)
    if (next.length === 2) {
      update((d) => ({ ...d, avoid: [...d.avoid, next] }))
      setSel([])
    } else setSel(next)
  }
  return (
    <Sheet title="Keep apart" color={color} icon={<Icon.people />} onClose={onClose} onBack={onBack}>
      <p className="cr-hint">Pick two students – the group maker will try to put them in different groups.</p>
      <div className="cr-pickgrid">
        {sortStudents(doc.students).map((s) => (
          <button type="button" key={s.id} className={`cr-pick ${sel.includes(s.id) ? 'is-active' : ''}`} onClick={() => choose(s.id)}>
            <Avatar a={s.avatar} /><span>{s.first}</span>
          </button>
        ))}
      </div>
      {doc.avoid.length > 0 && (
        <ul className="cr-pairs">
          {doc.avoid.map(([a, b], i) => (
            <li key={i}>
              <span>{byId[a] ? shortName(byId[a]) : '?'} ↔ {byId[b] ? shortName(byId[b]) : '?'}</span>
              <button className="cr-iconbtn cr-iconbtn--sm" aria-label="Remove pair" onClick={() => update((d) => ({ ...d, avoid: d.avoid.filter((_, j) => j !== i) }))}><Icon.close /></button>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  )
}

// ── Utasítások ──
export function DirectionsTool({ doc, update, onClose, onBack }) {
  const t = tool('directions')
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState('')
  const items = doc.directions
  const setItems = (fn) => update((d) => ({ ...d, directions: fn(d.directions) }))

  if (show && items.length) {
    return (
      <FullScreen color={t.color} onClose={onClose}>
        <ol className="cr-directions">
          {items.map((it, i) => (
            <li key={i} className={i === step ? 'is-current' : i < step ? 'is-done' : ''} onClick={() => setStep(i)}>
              <span>{i < step ? '✓' : i + 1}</span>{it}
            </li>
          ))}
        </ol>
        <div className="cr-controls">
          <button className="cr-ctrl" onClick={() => setStep((s) => Math.max(0, s - 1))} aria-label="Previous"><Icon.back /></button>
          <button className="cr-ctrl cr-ctrl--main" onClick={() => setStep((s) => Math.min(items.length, s + 1))} aria-label="Next"><Icon.next /></button>
          <button className="cr-ctrl" onClick={() => setShow(false)} aria-label="Edit"><Icon.pencil /></button>
        </div>
      </FullScreen>
    )
  }
  return (
    <Sheet title={t.label} color={t.color} icon={<t.icon />} onClose={onClose} onBack={onBack}>
      <ol className="cr-editlist">
        {items.map((it, i) => (
          <li key={i}>
            <span>{i + 1}.</span>
            <input value={it} onChange={(e) => setItems((l) => l.map((x, j) => (j === i ? e.target.value : x)))} aria-label={`Step ${i + 1}`} />
            <button className="cr-iconbtn cr-iconbtn--sm" aria-label="Delete" onClick={() => setItems((l) => l.filter((_, j) => j !== i))}><Icon.close /></button>
          </li>
        ))}
      </ol>
      <form className="cr-addrow" onSubmit={(e) => { e.preventDefault(); if (draft.trim()) { setItems((l) => [...l, draft.trim()]); setDraft('') } }}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="New step…" />
        <button className="cr-btn" type="submit"><Icon.plus />Add</button>
      </form>
      <div className="cr-form__actions">
        <span className="cr-spacer" />
        <button className="cr-btn cr-btn--primary" disabled={!items.length} onClick={() => { setStep(0); setShow(true) }}><Icon.play />Present</button>
      </div>
    </Sheet>
  )
}

// ── Gondold – Párban – Oszd meg ──
const PHASES = [
  { key: 'think', label: 'Think it over!', sub: 'Alone, in silence' },
  { key: 'pair', label: 'Discuss with your partner!', sub: 'In pairs' },
  { key: 'share', label: 'Share with the class!', sub: 'Together' },
]
export function TpsTool({ doc, update, onClose, onBack }) {
  const t = tool('tps')
  const [run, setRun] = useState(false)
  const tps = doc.tps
  const setDur = (k, min) => update((d) => ({ ...d, tps: { ...d.tps, [k]: Math.max(10, Math.round(min * 60)) } }))
  if (run) return <TpsRun doc={doc} color={t.color} onClose={onClose} />
  return (
    <Sheet title={t.label} color={t.color} icon={<t.icon />} onClose={onClose} onBack={onBack}>
      <div className="cr-tps-setup">
        {PHASES.map((p, i) => (
          <label key={p.key} className="cr-field cr-field--inline">
            <span><b>{i + 1}.</b> {p.label}</span>
            <input type="number" min="0.5" max="30" step="0.5" value={tps[p.key] / 60} onChange={(e) => setDur(p.key, Number(e.target.value) || 1)} /> min
          </label>
        ))}
      </div>
      <div className="cr-form__actions">
        <span className="cr-spacer" />
        <button className="cr-btn cr-btn--primary" onClick={() => setRun(true)}><Icon.play />Start</button>
      </div>
    </Sheet>
  )
}

function TpsRun({ doc, color, onClose }) {
  const [i, setI] = useState(0)
  const phase = PHASES[i]
  const present = useMemo(() => shuffle(doc.students.filter((s) => !isAbsent(doc, s.id))), [doc])
  const pairs = useMemo(() => {
    const out = []
    for (let k = 0; k < present.length; k += 2) out.push(present.slice(k, k + 2))
    if (out.length > 1 && out[out.length - 1].length === 1) out[out.length - 2].push(out.pop()[0])
    return out
  }, [present])
  const next = () => { if (i < PHASES.length - 1) { setI(i + 1); play('phase') } }
  const c = useCountdown(doc.tps[phase.key], () => { if (i < PHASES.length - 1) next(); else play('alarm') })
  useEffect(() => { c.restart(doc.tps[phase.key]) }, [i]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <FullScreen color={color} onClose={onClose}>
      <ol className="cr-tps-steps">
        {PHASES.map((p, k) => <li key={p.key} className={k === i ? 'is-current' : k < i ? 'is-done' : ''}>{k + 1}. {p.sub}</li>)}
      </ol>
      <AnimatePresence mode="wait">
        <motion.h2 key={phase.key} className="cr-tps-title" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>{phase.label}</motion.h2>
      </AnimatePresence>
      <div className="cr-bigtime cr-bigtime--md">{fmtTime(c.left)}</div>
      {phase.key === 'pair' && pairs.length > 0 && (
        <div className="cr-tps-pairs">
          {pairs.map((p, k) => <span key={k}>{p.map((s) => s.first).join(' + ')}</span>)}
        </div>
      )}
      <div className="cr-controls">
        <button className="cr-ctrl cr-ctrl--main" onClick={c.toggle} aria-label={c.running ? 'Pause' : 'Resume'}>{c.running ? <Icon.pause /> : <Icon.play />}</button>
        <button className="cr-ctrl" onClick={next} disabled={i === PHASES.length - 1} aria-label="Next phase"><Icon.next /></button>
      </div>
    </FullScreen>
  )
}
