// Kiváltságok a szerveren: a lista (alapértelmezésekkel) és a diák elkölthető egyenlege.
import { workEvents } from './studentWork.mjs'
export { privilegesOf, DEFAULT_PRIVILEGES } from '../../src/classroom/privileges.js'

// egyenleg: az idei pontok (a tanári események + a beadásokból/beváltásokból képzettek),
// mínusz a még függő kérések ára
export function balanceOf(doc, sid, w) {
  const own = (doc?.events || []).filter((e) => e.s === sid && e.src !== 'x')
  const sum = [...own, ...workEvents(doc, sid, w)].reduce((a, e) => a + (Number(e.v) || 0), 0)
  const pending = (w?.reqs || []).filter((r) => r.status === 'pending').reduce((a, r) => a + (Number(r.cost) || 0), 0)
  return sum - pending
}
