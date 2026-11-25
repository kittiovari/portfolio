import { Link } from 'react-router-dom'
import { useLanguage, useTranslation } from '../i18n/LanguageContext.jsx'
import { profileArt } from '../components/AreaIllustrations.jsx'
import '../components/Hero.css'
import './Landing.css'

// Egy nyelvoktatási csoport saját oldala (pl. /nyelvoktatas/9b).
// A cím nyilvános, a bevezető és minden további tartalom a csoport védett
// tartalmából jön (csak az adott csoport jelszavával érhető el).
function ClassPage({ id }) {
  const { language, setLanguage } = useLanguage()
  const t = useTranslation()
  const title = t.topics.classes?.[id]?.title ?? id
  const intro = t.classes?.[id]?.intro
  const Art = profileArt[`language-${id}`]

  return (
    <main className="landing">
      <div className="container landing__inner">
        <header className="bento-header">
          <div className="bento-header__titles">
            <Link to="/" className="bento-back">← {t.topics.back}</Link>
            <h1 className="bento-portfolio-title class-title">
              {Art && <span className={`class-title__badge pw-profile__circle--language-${id}`} aria-hidden="true"><Art /></span>}
              {title}
            </h1>
          </div>
          <div className="hero-controls">
            <button className={`hc-lang ${language === 'hu' ? 'hc-lang--active' : ''}`} onClick={() => setLanguage('hu')}>HU</button>
            <span className="hc-divider" />
            <button className={`hc-lang ${language === 'en' ? 'hc-lang--active' : ''}`} onClick={() => setLanguage('en')}>EN</button>
          </div>
        </header>
        <section className="landing-tile landing-tile--language topic-card">
          {intro && <p className="topic-card__intro">{intro}</p>}
          <p className="landing-tile__desc">{t.topics.soon}</p>
        </section>
      </div>
    </main>
  )
}

export default ClassPage
