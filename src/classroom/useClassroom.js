import { useCallback, useEffect, useRef, useState } from 'react'
import { emptyClass, migrateToEnglish, ensureSkills, ensureCodes } from './model.js'

// Az osztály adatainak betöltése és automatikus mentése a szerverre.
// Minden módosítás azonnal látszik (optimista frissítés); a mentés kis
// késleltetéssel, összevonva megy. Ha közben másik eszközön is mentettek
// (409), a friss szerverállapotot töltjük be, és jelezzük.
// status: loading | ready | saving | saved | error | conflict | locked
export function useClassroom(cls) {
  const [doc, setDoc] = useState(null)
  const [status, setStatus] = useState('loading')
  const docRef = useRef(null)
  const timer = useRef(null)
  const inflight = useRef(false)
  const dirty = useRef(false)
  const saveRef = useRef(null)
  const schoolTimer = useRef(null)

  // Közös iskolai naptár (tanév, szünetek, rövidített napok) – egyszer kell megadni
  const saveSchool = useCallback((d) => {
    clearTimeout(schoolTimer.current)
    schoolTimer.current = setTimeout(() => {
      fetch('/api/school', {
        method: 'PUT', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ school: { calendar: d.calendar || {}, shortDays: d.shortDays || [] } }),
      }).catch(() => {})
    }, 600)
  }, [])

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const res = await fetch(`/api/classroom/${cls}`, { credentials: 'same-origin', cache: 'no-store' })
      if (res.status === 401) { setStatus('locked'); return }
      if (!res.ok) throw new Error(res.status)
      const data = await res.json()
      const school = await fetch('/api/school', { credentials: 'same-origin', cache: 'no-store' }).then((r) => (r.ok ? r.json() : {})).then((x) => x.school).catch(() => null)
      const base = data.doc ? { ...emptyClass(), ...data.doc } : emptyClass()
      // a közös naptár az irányadó; ha még nincs, ennek az osztálynak a beállításaiból indul
      const loaded = school ? { ...base, calendar: school.calendar || base.calendar, shortDays: school.shortDays || base.shortDays } : base
      if (!school && (base.calendar?.start || base.calendar?.breaks?.length || base.shortDays?.length)) saveSchool(base)
      // A korábbi magyar alapértelmezések angolra cserélése (egyszeri, utána elmentjük)
      const next = ensureCodes(ensureSkills(migrateToEnglish(loaded)))
      docRef.current = next
      setDoc(next)
      setStatus('ready')
      if (next !== loaded && data.doc) {
        dirty.current = true
        clearTimeout(timer.current)
        timer.current = setTimeout(() => saveRef.current?.(), 600)
      }
    } catch {
      setStatus('error')
    }
  }, [cls, saveSchool])

  useEffect(() => {
    dirty.current = false
    clearTimeout(timer.current)
    setDoc(null)
    load()
  }, [load])

  const save = useCallback(async () => {
    if (inflight.current) { dirty.current = true; return }
    if (!docRef.current) return
    inflight.current = true
    dirty.current = false
    setStatus('saving')
    const sent = docRef.current
    try {
      const res = await fetch(`/api/classroom/${cls}`, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doc: sent }),
      })
      if (res.status === 409) {
        const data = await res.json().catch(() => ({}))
        const fresh = data.doc ? { ...emptyClass(), ...data.doc } : emptyClass()
        docRef.current = fresh
        setDoc(fresh)
        setStatus('conflict')
        dirty.current = false
        return
      }
      if (res.status === 401) { setStatus('locked'); return }
      if (!res.ok) throw new Error(res.status)
      const { rev } = await res.json()
      // A mentés közben érkezett módosítások is megkapják az új rev-et
      docRef.current = { ...docRef.current, rev }
      setStatus('saved')
    } catch {
      setStatus('error')
      dirty.current = true
    } finally {
      inflight.current = false
      if (dirty.current) {
        clearTimeout(timer.current)
        timer.current = setTimeout(save, 800)
      }
    }
  }, [cls])

  saveRef.current = save

  // update(fn): fn a régi dokumentumból újat ad vissza
  const update = useCallback((fn) => {
    if (!docRef.current) return
    const prev = docRef.current
    const next = fn(prev)
    if (next.calendar !== prev.calendar || next.shortDays !== prev.shortDays) saveSchool(next)
    docRef.current = next
    setDoc(next)
    dirty.current = true
    clearTimeout(timer.current)
    timer.current = setTimeout(save, 600)
  }, [save, saveSchool])

  // Oldal elhagyása előtt figyelmeztetés, ha még nincs elmentve
  useEffect(() => {
    const onLeave = (e) => {
      if (dirty.current || inflight.current) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', onLeave)
    return () => window.removeEventListener('beforeunload', onLeave)
  }, [])

  return { doc, status, update, reload: load, retry: save }
}
