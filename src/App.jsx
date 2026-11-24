import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import UX from './pages/UX.jsx'
import Topic from './pages/Topic.jsx'
import CV from './pages/CV.jsx'
import { isUnlocked } from './lib/unlock.js'

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
  Zárolt területi oldal. Esetek:
  - már feloldva ebben a munkamenetben (csempéről jött, vagy korábban megadta)
    → az oldal azonnal megjelenik;
  - közvetlen URL / frissítés / könyvjelző / megosztott link, feloldás nélkül
    → a nyitóoldal homályosítva, előtte a jelszómodal;
      helyes jelszó → az oldal betölt ugyanazon az URL-en (#horgonyt is követi),
      bezárás (X, Esc, háttér) → vissza a nyitóoldalra.
*/
function Gated({ area, children }) {
  const { hash } = useLocation()
  const [open, setOpen] = useState(() => isUnlocked(area))

  useEffect(() => {
    if (!open || !hash) return
    const id = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'instant', block: 'start' }), 120)
    return () => clearTimeout(id)
  }, [open, hash])

  if (open) return children
  return <Landing gateArea={area} onUnlock={() => setOpen(true)} />
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/ux" element={<Gated area="ux" key="ux"><UX /></Gated>} />
        <Route path="/nyelvoktatas" element={<Gated area="language" key="language"><Topic topic="language" /></Gated>} />
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
