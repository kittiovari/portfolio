import { useCallback, useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import UX from './pages/UX.jsx'
import Topic from './pages/Topic.jsx'
import CV from './pages/CV.jsx'
import ClassPage from './pages/ClassPage.jsx'
import { AREAS, fetchContent, refreshSession, unlockedLanguageAreas } from './lib/unlock.js'
import { useProtectedContent } from './i18n/LanguageContext.jsx'

// Oldalváltáskor az új oldal tetejére ugrunk; #horgonynál a horgonyhoz.
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) { window.scrollTo(0, 0); return }
    const id = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'instant', block: 'start' }), 80)
    return () => clearTimeout(id)
  }, [pathname, hash])
  return null
}

/*
  Zárolt területi oldal. A tartalom NINCS benne a letöltött kódban: a szerver
  csak érvényes (HttpOnly) munkamenet-süti mellett adja ki. Esetek:
  - érvényes süti (csempéről jött, frissít, könyvjelző a 7 napos érvényességen belül)
    → a tartalom letöltődik, az oldal megjelenik;
  - nincs/lejárt süti (közvetlen URL, megosztott link, más böngésző)
    → a nyitóoldal homályosítva, előtte a jelszómodal;
      helyes jelszó → a szerver sütit ad, a tartalom letöltődik, az URL marad
      (#horgonyt is követi); bezárás (X, Esc, háttér) → vissza a nyitóoldalra.
  - a szerver nem elérhető → szintén a jelszómodal, ami jelzi a hibát.
*/
function Gated({ area, children }) {
  const { hash } = useLocation()
  const { protectedContent, addProtected } = useProtectedContent()
  const [state, setState] = useState(() => (protectedContent[area] ? 'open' : 'checking'))

  const load = useCallback(async () => {
    const res = await fetchContent(area)
    if (res.status === 200) {
      addProtected(area, res.data)
      setState('open')
    } else {
      setState('locked')
    }
  }, [area, addProtected])

  useEffect(() => {
    if (state === 'checking') load()
  }, [state, load])

  useEffect(() => {
    if (state !== 'open' || !hash) return
    const id = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'instant', block: 'start' }), 120)
    return () => clearTimeout(id)
  }, [state, hash])

  if (state === 'open') return children
  if (state === 'checking') return <div className="home" aria-busy="true" />
  return <Landing gateArea={area} onUnlock={() => setState('checking')} />
}

/*
  /nyelvoktatas – csoportválasztó belépési pont.
  - ha pontosan egy csoport van feloldva ebben a böngészőben → egyenesen oda;
  - különben a nyitóoldal homályosítva, előtte a profilválasztós jelszómodal;
    azonosítás után a kiválasztott csoport saját aloldalára érkezünk.
*/
function LanguageHub() {
  const [target, setTarget] = useState(undefined)
  useEffect(() => {
    let alive = true
    refreshSession().then(() => {
      if (!alive) return
      const open = unlockedLanguageAreas()
      setTarget(open.length === 1 ? AREAS[open[0]].path : null)
    })
    return () => { alive = false }
  }, [])
  if (target === undefined) return <div className="home" aria-busy="true" />
  if (target) return <Navigate to={target} replace />
  return <Landing gateArea="language" />
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/ux" element={<Gated area="ux" key="ux"><UX /></Gated>} />
        <Route path="/nyelvoktatas" element={<LanguageHub />} />
        <Route path="/nyelvoktatas/9b" element={<Gated area="language-9b" key="language-9b"><ClassPage id="9b" /></Gated>} />
        <Route path="/nyelvoktatas/9d" element={<Gated area="language-9d" key="language-9d"><ClassPage id="9d" /></Gated>} />
        <Route path="/muveszetterapia" element={<Gated area="arttherapy" key="arttherapy"><Topic topic="arttherapy" /></Gated>} />
        <Route path="/cv" element={<CV />} />
        {/* Rövid / alternatív címek */}
        <Route path="/oktatas" element={<Navigate to="/nyelvoktatas" replace />} />
        <Route path="/muveszet" element={<Navigate to="/muveszetterapia" replace />} />
        {/* Ismeretlen cím → nyitóoldal */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
