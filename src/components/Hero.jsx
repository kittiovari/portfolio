import { motion } from 'framer-motion'
import './Hero.css'

function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="container hero__content">
        <motion.p
          className="hero__greeting"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Szia, Kitti vagyok
        </motion.p>

        <motion.h1
          className="hero__title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          UX/UI <span className="copper-text">Designer</span>
        </motion.h1>

        <motion.p
          className="hero__subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          Felhasználóközpontú, elegáns digitális élményeket tervezek.
        </motion.p>

        <motion.div
          className="hero__actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <a href="#works" className="btn btn--primary">Munkáim</a>
          <a href="#contact" className="btn btn--outline">Kapcsolat</a>
        </motion.div>
      </div>

      <motion.div
        className="hero__scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <div className="hero__scroll-line" />
      </motion.div>
    </section>
  )
}

export default Hero
