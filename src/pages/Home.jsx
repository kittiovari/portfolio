import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'
import PositioningStrip from '../components/PositioningStrip.jsx'
import About from '../components/About.jsx'
import OrbitLogos from '../components/OrbitLogos.jsx'
import Works from '../components/Works.jsx'
import Thinking from '../components/Thinking.jsx'
import Values from '../components/Values.jsx'
import Footer from '../components/Footer.jsx'

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <PositioningStrip />
      <About />
      <OrbitLogos />
      <Works />
      <Thinking />
      <Values />
      <Footer />
    </>
  )
}

export default Home
