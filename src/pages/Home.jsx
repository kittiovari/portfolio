import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'
import SectionDivider from '../components/SectionDivider.jsx'
import About from '../components/About.jsx'
import OrbitLogos from '../components/OrbitLogos.jsx'
import Works from '../components/Works.jsx'
import Footer from '../components/Footer.jsx'

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <SectionDivider />
      <About />
      <OrbitLogos />
      <SectionDivider />
      <Works />
      <SectionDivider />
      <Footer />
    </>
  )
}

export default Home
