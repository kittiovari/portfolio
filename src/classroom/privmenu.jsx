import { useState } from 'react'
import Avatar from './Avatar.jsx'
import { Sheet, Icon } from './ui.jsx'
import { Art } from './art.jsx'
import { ChannelArt, MUSIC_CHANNELS } from './session.jsx'
import { privilegesOf, PRIV_ARTS, DEFAULT_PRIVILEGES } from './privileges.js'
import { fullName, uid } from './model.js'

/*
  Kiváltság-menü: a tanár állítja össze (név, ár), a diák a saját lapjáról kéri,
  a tanár jóváhagyja → a pontok levonása beváltás-eseményként (szintet nem csökkent,
  E-Kréta-szövegbe nem kerül). Rangsor / osztályszintű kimutatás nincs.
*/
const fmt = (t) => new Date(t).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
const STATUS = { pending: 'Waiting for your teacher', approved: 'Approved', declined: 'Not this time' }

async function studentPost(cls, body) {
  const res = await fetch(`/api/studentwork/${cls}`, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const b = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(b.error || res.status), { status: res.status, body: b })
  return b
}

// ── Diák: a saját lapján ──
export function PrivilegeShop({ cls, code, me, privileges = [], onChange }) {
  const [busy, setBusy] = useState(null)
  const [msg, setMsg] = useState('')
  const [dj, setDj] = useState(null) // DJ-kéréshez a választott zene
  const balance = me.balance ?? 0
  const reqs = [...(me.reqs || [])].sort((a, b) => b.at - a.at)
  const request = async (p, choice) => {
    setBusy(p.id); setMsg('')
    try {
      const r = await studentPost(cls, { code, id: me.id, action: 'request', pid: p.id, choice })
      onChange({ reqs: r.reqs, balance: r.balance }); setDj(null)
    } catch (e) {
      setMsg(e.body?.error === 'points' ? 'Not enough points yet.' : e.body?.error === 'too-many' ? 'You already have 3 requests waiting.' : e.status === 429 ? 'Too many tries – wait a few minutes.' : 'Something went wrong – try again.')
    } finally { setBusy(null) }
  }
  const cancel = async (r) => {
    setBusy(r.id); setMsg('')
    try { const x = await studentPost(cls, { code, id: me.id, action: 'cancel', req: r.id }); onChange({ reqs: x.reqs, balance: x.balance }) } catch { setMsg('Something went wrong – try again.') } finally { setBusy(null) }
  }
  return (
    <section className="cr-priv">
      <div className="cr-priv__balance">
        <Art name="ticket" className="cr-art cr-art--md" />
        <span><b>{balance}</b> point{Math.abs(balance) === 1 ? '' : 's'} to spend</span>
        <small className="cr-muted">Spending points never lowers your level.</small>
      </div>
      <ul className="cr-priv__list">
        {privileges.map((p) => {
          const can = balance >= p.cost
          return (
            <li key={p.id} className={can ? '' : 'is-dim'}>
              <Art name={p.art} className="cr-art cr-art--lg" />
              <span className="cr-priv__name"><b>{p.name}</b><small>{p.cost} points</small></span>
              {dj === p.id ? (
                <span className="cr-priv__dj" role="group" aria-label="Pick the music">
                  {MUSIC_CHANNELS.map((c) => (
                    <button key={c.id} className="cr-chan cr-chan--sm" style={{ '--ch': c.color }} onClick={() => request(p, c.id)} disabled={busy === p.id}>
                      <ChannelArt id={c.id} /><span>{c.label}</span>
                    </button>
                  ))}
                  <button className="cr-link" onClick={() => setDj(null)}>Cancel</button>
                </span>
              ) : (
                <button className="cr-btn cr-btn--sm cr-btn--primary" disabled={!can || busy === p.id} onClick={() => (p.dj ? setDj(p.id) : request(p))}>
                  {can ? 'Ask for it' : `${p.cost - balance} more`}
                </button>
              )}
            </li>
          )
        })}
      </ul>
      {msg && <p className="cr-codeform__err" role="alert">{msg}</p>}
      {reqs.length > 0 && (
        <div className="cr-priv__mine">
          <h4>My requests</h4>
          <ul>
            {reqs.slice(0, 12).map((r) => (
              <li key={r.id} className={`is-${r.status}`}>
                <span><b>{r.name}</b>{r.choice ? ` · ${r.choice === 'active' ? 'Active' : 'Relax'} music` : ''}<small>{fmt(r.at)} · −{r.cost}</small></span>
                <em>{STATUS[r.status]}</em>
                {r.status === 'pending' && <button className="cr-link" onClick={() => cancel(r)} disabled={busy === r.id}>Cancel</button>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

// a függő kérések száma (tanári jelvény)
export const pendingRequests = (work) => Object.values(work || {}).reduce((n, w) => n + (w.reqs || []).filter((r) => r.status === 'pending').length, 0)

// ── Tanár: a kérések jóváhagyása ──
export function PrivilegeRequests({ doc, work, post, points, onClose }) {
  const [busy, setBusy] = useState(null)
  const [err, setErr] = useState('')
  const byId = Object.fromEntries(doc.students.map((s) => [s.id, s]))
  const all = Object.entries(work || {}).flatMap(([sid, w]) => (w.reqs || []).map((r) => ({ sid, r }))).filter((x) => byId[x.sid])
  const pending = all.filter((x) => x.r.status === 'pending').sort((a, b) => a.r.at - b.r.at)
  const done = all.filter((x) => x.r.status !== 'pending').sort((a, b) => (b.r.dt || 0) - (a.r.dt || 0)).slice(0, 20)
  const decide = async (sid, r, approve) => {
    setBusy(r.id); setErr('')
    try { await post({ action: 'decide', sid, req: r.id, approve }) } catch { setErr('Could not save – try again.') } finally { setBusy(null) }
  }
  const row = ({ sid, r }, actions) => {
    const s = byId[sid]
    return (
      <li key={r.id} className={`cr-privreq is-${r.status}`}>
        <Avatar a={s.avatar} />
        <span className="cr-privreq__who"><b>{fullName(s)}</b><small>{r.name}{r.choice ? ` · ${r.choice === 'active' ? 'Active' : 'Relax'} music` : ''} · {fmt(r.at)}</small></span>
        <span className="cr-chip cr-chip--muted">−{r.cost}</span>
        {actions ? (
          <span className="cr-privreq__btns">
            <button className="cr-btn cr-btn--sm" onClick={() => decide(sid, r, false)} disabled={busy === r.id}>Decline</button>
            <button className="cr-btn cr-btn--sm cr-btn--primary" onClick={() => decide(sid, r, true)} disabled={busy === r.id} title={(points[sid] || 0) < r.cost ? 'Not enough points any more' : undefined}><Icon.check />Approve</button>
          </span>
        ) : <em>{r.status === 'approved' ? 'Approved' : 'Declined'}</em>}
      </li>
    )
  }
  return (
    <Sheet title="Privilege requests" onClose={onClose} wide className="cr-privreqs">
      {err && <p className="cr-codeform__err" role="alert">{err}</p>}
      {!pending.length ? <p className="cr-hint">No requests waiting.</p> : <ul className="cr-privreqs__list">{pending.map((x) => row(x, true))}</ul>}
      <p className="cr-muted">Approving deducts the points as a “Privilege” entry – it never lowers the student’s level and isn’t part of the E-Kréta text. Edit the menu in Class settings → Privileges.</p>
      {done.length > 0 && (<><h4>Recent</h4><ul className="cr-privreqs__list">{done.map((x) => row(x, false))}</ul></>)}
    </Sheet>
  )
}

// ── Tanár: a menü szerkesztése (Class settings → Privileges) ──
export function PrivilegeEditor({ doc, update }) {
  const list = privilegesOf(doc)
  const setList = (fn) => update((d) => ({ ...d, privileges: fn(privilegesOf(d)) }))
  const set = (id, patch) => setList((l) => l.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  return (
    <div className="cr-priveditor">
      <p className="cr-hint">Students ask for these from their own page; you approve them in the ticket menu at the top. The DJ privilege lets them pick the warmer music (Relax / Active) – it shows up in Timer &amp; music.</p>
      <ul>
        {list.map((p) => (
          <li key={p.id}>
            <details className="cr-priveditor__art">
              <summary aria-label="Change icon"><Art name={p.art} className="cr-art cr-art--md" /></summary>
              <span>{PRIV_ARTS.map((a) => <button key={a} type="button" className={a === p.art ? 'is-active' : ''} onClick={(e) => { set(p.id, { art: a }); e.currentTarget.closest('details').open = false }} aria-label={a}><Art name={a} className="cr-art cr-art--sm" /></button>)}</span>
            </details>
            <input value={p.name} onChange={(e) => set(p.id, { name: e.target.value.slice(0, 60) })} aria-label="Privilege" />
            <label className="cr-priveditor__cost"><input type="number" min="1" max="200" value={p.cost} onChange={(e) => set(p.id, { cost: Math.max(1, Math.min(200, Math.round(Number(e.target.value) || 1))) })} aria-label="Cost in points" /><small>points</small></label>
            {p.dj && <span className="cr-chip cr-chip--muted">DJ</span>}
            <button className="cr-iconbtn cr-iconbtn--sm" onClick={() => setList((l) => l.filter((x) => x.id !== p.id))} aria-label={`Delete ${p.name}`}><Icon.trash /></button>
          </li>
        ))}
      </ul>
      <div className="cr-form__actions">
        <button className="cr-btn cr-btn--sm" onClick={() => setList((l) => [...l, { id: uid(), name: 'New privilege', cost: 5, art: 'ticket' }])} disabled={list.length >= 20}><Icon.plus />Add privilege</button>
        {!list.some((p) => p.dj) && <button className="cr-btn cr-btn--sm" onClick={() => setList((l) => [DEFAULT_PRIVILEGES[0], ...l])}>Add DJ again</button>}
      </div>
    </div>
  )
}
