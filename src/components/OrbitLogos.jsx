import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import './OrbitLogos.css'

// Icons in OK logo style: thin strokes, rounded caps, elegant curves
const sw = '1.2'
const svgProps = { fill: 'none', stroke: 'currentColor', strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' }

const icons = {
  appartman: (
    <svg viewBox="0 0 24 24" {...svgProps}>
      <path d="M5 21C5 21 5 9 12 4c7 5 7 17 7 17"/><path d="M9 21v-5c0-1.5 1.3-3 3-3s3 1.5 3 3v5"/>
    </svg>
  ),
  mixie: (
    <svg viewBox="0 0 24 24" {...svgProps}>
      <path d="M4 20h16M4 20V10l4-4 4 6 4-8 4 10v6"/>
    </svg>
  ),
  winefo: (
    <svg viewBox="0 0 24 24" {...svgProps}>
      <path d="M9 3h6v4a3 3 0 01-3 3 3 3 0 01-3-3V3z"/><path d="M12 10v5"/><path d="M8 21h8"/><path d="M12 15v6"/><path d="M5 12h14"/>
    </svg>
  ),
  uniqa: (
    <svg viewBox="0 0 24 24" {...svgProps}>
      <path d="M12 3C8 5 4 6 4 11c0 5 4 8 8 10 4-2 8-5 8-10 0-5-4-6-8-8z"/>
    </svg>
  ),
  booked4us: (
    <svg viewBox="0 0 24 24" {...svgProps}>
      <path d="M4 8c0-2 1-3 3-3h10c2 0 3 1 3 3v10c0 2-1 3-3 3H7c-2 0-3-1-3-3z"/><path d="M8 3v3M16 3v3"/><path d="M4 10h16"/>
    </svg>
  ),
  chantblaster: (
    <svg viewBox="0 0 24 24" {...svgProps}>
      <path d="M9 18V5c0-1 1-2 2-2l8-1v14"/><circle cx="7" cy="18" r="3"/><circle cx="19" cy="16" r="3"/>
    </svg>
  ),
  codeescrow: (
    <svg viewBox="0 0 24 24" {...svgProps}>
      <path d="M7 11V8c0-3 2-5 5-5s5 2 5 5v3"/><path d="M4 11c0-1 1-2 2-2h12c1 0 2 1 2 2v8c0 1-1 2-2 2H6c-1 0-2-1-2-2z"/><circle cx="12" cy="16" r="1.5"/>
    </svg>
  ),
  moodmeup: (
    <svg viewBox="0 0 24 24" {...svgProps}>
      <circle cx="12" cy="12" r="9"/><path d="M8 14c1 2 3 3 4 3s3-1 4-3"/><circle cx="9" cy="10" r="0.8"/><circle cx="15" cy="10" r="0.8"/>
    </svg>
  ),
  cib: (
    <svg viewBox="0 0 24 24" {...svgProps}>
      <path d="M4 21h16"/><path d="M12 4L4 9h16z"/><path d="M6 9v12M10 9v12M14 9v12M18 9v12"/>
    </svg>
  ),
  danubius: (
    <svg viewBox="0 0 24 24" {...svgProps}>
      <path d="M3 5c0-1 1-2 2-2h14c1 0 2 1 2 2v10c0 1-1 2-2 2H5c-1 0-2-1-2-2z"/><path d="M8 21h8"/><path d="M12 17v4"/>
    </svg>
  ),
  alphavet: (
    <svg viewBox="0 0 24 24" {...svgProps}>
      <circle cx="8" cy="5" r="2"/><circle cx="16" cy="5" r="2"/>
      <circle cx="5" cy="11" r="2"/><circle cx="19" cy="11" r="2"/>
      <ellipse cx="12" cy="17" rx="5" ry="4.5"/>
    </svg>
  ),
  cig: (
    <svg viewBox="0 0 24 24" {...svgProps}>
      <path d="M12 3C7 5 4 8 4 13c0 4 3 7 8 9 5-2 8-5 8-9 0-5-3-8-8-10z"/>
    </svg>
  ),
}

const partners = [
  { text: 'Appartman', x: 5, y: 8, s: 72, employer: true, icon: 'appartman' },
  { text: 'Mixie', x: 78, y: 65, s: 60, icon: 'mixie' },
  { text: 'Winefo', x: 88, y: 28, s: 58, icon: 'winefo' },
  { text: 'UNIQA', x: 42, y: 5, s: 70, icon: 'uniqa' },
  { text: 'Booked4us', x: 28, y: 52, s: 60, icon: 'booked4us' },
  { text: 'Chantblaster', x: 75, y: 4, s: 62, icon: 'chantblaster' },
  { text: 'Code Escrow\nCloud', x: 60, y: 55, s: 62, icon: 'codeescrow' },
  { text: 'MoodMeUp', x: 2, y: 55, s: 58, icon: 'moodmeup' },
  { text: 'CIB Bank', x: 18, y: 22, s: 76, employer: true, icon: 'cib' },
  { text: 'Danubius IT\nSolutions', x: 55, y: 25, s: 82, employer: true, icon: 'danubius' },
  { text: 'AlphaVet', x: 38, y: 68, s: 58, icon: 'alphavet' },
  { text: 'CIG Pannónia', x: 12, y: 40, s: 80, employer: true, icon: 'cig' },
]

function OrbitLogos() {
  const { language } = useLanguage()
  const [hovered, setHovered] = useState(null)

  return (
    <section className="orbit">
      <div className="orbit__header">
        {language === 'hu' ? 'Akikkel dolgoztam' : 'Clients & partners'}
      </div>
      <div className="orbit__space">
        {partners.map((item, i) => (
          <motion.div
            key={item.text}
            className={`orbit__float ${item.employer ? 'orbit__float--employer' : ''} ${hovered !== null && hovered !== i ? 'orbit__float--dimmed' : ''}`}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              width: item.s,
              height: item.s,
            }}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: item.employer ? 0.55 : 0.18, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
              delay: 0.08 * i,
              duration: 0.6,
              type: 'spring',
              stiffness: 120,
              damping: 14,
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="orbit__icon">{icons[item.icon]}</span>
            <span className="orbit__text" style={{ whiteSpace: 'pre-line' }}>{item.text}</span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default OrbitLogos
