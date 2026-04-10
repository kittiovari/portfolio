import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './Navbar.css'

function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="navbar__inner">
        <a href="#hero" className="navbar__logo">
          <img src="/logo.svg" alt="Kitti H. Óvári" />
        </a>
        <ul className="navbar__links">
          <li><a href="#about">Rólam</a></li>
          <li><a href="#works">Munkáim</a></li>
          <li><a href="#contact" className="navbar__cta">Kapcsolat</a></li>
        </ul>
      </div>
    </motion.nav>
  )
}

export default Navbar
