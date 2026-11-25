import { useState } from 'react'
import Avatar from './Avatar.jsx'
import { Icon } from './ui.jsx'
import { sortStudents } from './model.js'

/*
  Padtársak (Pairs nézet): tartós párok – a csoportokkal ellentétben nem törlődnek órák között.
  doc.deskmates = [[idA, idB], …]  (egy padban legfeljebb 2 diák)
  Áthelyezés: húzd és ejtsd, vagy koppints a diákra, majd a célpadra.
*/
export default function Deskmates({ doc, update, points, onGive }) {
  const [picked, setPicked] = useState(null)
  const desks = (doc.deskmates || []).map((d) => d.filter((id) => doc.students.some((s) => s.id === id))).filter((d) => d.length)
  const seated = new Set(desks.flat())
  const pool = sortStudents(doc.students.filter((s) => !seated.has(s.id)))
  const byId = Object.fromEntries(doc.students.map((s) => [s.id, s]))

  // target: padsorszám, 'new' (új pad) vagy 'pool' (kivesszük a padból)
  const move = (id, target) => {
    setPicked(null)
    update((d) => {
      let list = (d.deskmates || []).map((x) => x.filter((y) => y !== id))
      if (target === 'new') list.push([id])
      else if (target !== 'pool') {
        const desk = list[target] || []
        // tele pad: a második helyen ülő visszakerül a szabadok közé
        list[target] = desk.length >= 2 ? [desk[0], id] : [...desk, id]
      }
      list = list.filter((x) => x.length)
      return { ...d, deskmates: list }
    })
  }
  const dropProps = (target) => ({
    onDragOver: (e) => { e.preventDefault(); e.currentTarget.classList.add('is-drop') },
    onDragLeave: (e) => e.currentTarget.classList.remove('is-drop'),
    onDrop: (e) => { e.preventDefault(); e.currentTarget.classList.remove('is-drop'); const id = e.dataTransfer.getData('text/plain'); if (id) move(id, target) },
    onClick: () => { if (picked) move(picked, target) },
  })
  const Person = ({ id }) => {
    const s = byId[id]
    if (!s) return null
    return (
      <div className={`cr-desk__person ${picked === id ? 'is-picked' : ''}`} draggable
        onDragStart={(e) => { e.dataTransfer.setData('text/plain', id); e.dataTransfer.effectAllowed = 'move' }}
        onClick={(e) => { e.stopPropagation(); setPicked(picked === id ? null : id) }} title="Drag to a desk">
        <Avatar a={s.avatar} />
        <span>{s.first}</span>
      </div>
    )
  }

  return (
    <div className="cr-desks-wrap">
      <div className="cr-desks">
        {desks.map((d, i) => {
          const total = d.reduce((sum, id) => sum + (points[id] || 0), 0)
          return (
            <div key={i} className={`cr-desk ${picked && !d.includes(picked) ? 'is-target' : ''}`} {...dropProps(i)}>
              <div className="cr-desk__head">
                <b>Desk {i + 1}</b>
                <span className={`cr-badge ${total < 0 ? 'is-neg' : ''}`}>{total}</span>
                <span className="cr-spacer" />
                <button className="cr-iconbtn cr-iconbtn--sm" title="Give points to this pair" aria-label="Give points to this pair"
                  onClick={(e) => { e.stopPropagation(); onGive(d, `Desk ${i + 1}`) }}><Icon.plus /></button>
              </div>
              <div className="cr-desk__seats">
                {d.map((id) => <Person key={id} id={id} />)}
                {d.length < 2 && <div className="cr-desk__empty">empty seat</div>}
              </div>
            </div>
          )
        })}
        <div className={`cr-desk cr-desk--new ${picked ? 'is-target' : ''}`} {...dropProps('new')}>
          <Icon.plus /><span>New desk</span><small>drop a student here</small>
        </div>
      </div>

      <div className={`cr-desk-pool ${picked && seated.has(picked) ? 'is-target' : ''}`} {...dropProps('pool')}>
        <span className="cr-desk-pool__label">{pool.length ? 'Not seated yet' : 'Everyone has a seat'}</span>
        <div className="cr-desk-pool__list">{pool.map((s) => <Person key={s.id} id={s.id} />)}</div>
      </div>
      {desks.length > 0 && (
        <button className="cr-link cr-groups__clear" onClick={() => { if (window.confirm('Clear all desks?')) update((d) => ({ ...d, deskmates: [] })) }}>
          <Icon.trash />Clear all desks
        </button>
      )}
    </div>
  )
}
