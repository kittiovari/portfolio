import { Link } from 'react-router-dom'
import { useLanguage, useTranslation } from '../i18n/LanguageContext.jsx'
import '../components/Hero.css'
import './Landing.css'

// Egyelőre közös vázoldal a Nyelvoktatás és a Művészetterápia területnek
function Topic({ topic }) {
  const { language, setLanguage } = useLanguage()
  const t = useTranslation()
  const page = t.topics[topic]

  return (
    <main className="landing">
      <div className="container landing__inner">
        <header className="bento-header">
          <div className="bento-header__titles">
            <Link to="/" className="bento-back">← {t.topics.back}</Link>
            <h1 className="bento-portfolio-title">{page.title}</h1>
          </div>
          <div className="hero-controls">
            <button className={`hc-lang ${language === 'hu' ? 'hc-lang--active' : ''}`} onClick={() => setLanguage('hu')}>HU</button>
            <span className="hc-divider" />
            <button className={`hc-lang ${language === 'en' ? 'hc-lang--active' : ''}`} onClick={() => setLanguage('en')}>EN</button>
          </div>
        </header>
        <section className={`landing-tile landing-tile--${topic} topic-card`}>
          <p className="topic-card__intro">{page.intro}</p>
          <p className="landing-tile__desc">{t.topics.soon}</p>
        </section>
      </div>
    </main>
  )
}

export default Topic
