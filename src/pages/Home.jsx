import { motion } from 'framer-motion'

function Home() {
  return (
    <main>
      <motion.section
        className="hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1>Portfolio</h1>
        <p>UX/UI Designer</p>
      </motion.section>
    </main>
  )
}

export default Home
