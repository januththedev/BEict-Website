import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import LmsBanner from './components/LmsBanner.jsx'
import About from './components/About.jsx'
import Features from './components/Features.jsx'
import ScrollJourney from './components/ScrollJourney.jsx'
import Community from './components/Community.jsx'
import Gallery from './components/Gallery.jsx'
import Banners from './components/Banners.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import OrangeRain from './components/OrangeRain.jsx'

export default function App() {
  return (
    <>
      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-brand-700 focus:shadow-lg"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <LmsBanner />
        <About />
        <Features />
        <ScrollJourney />
        <Community />
        <Gallery />
        <Banners />
        <Contact />
      </main>
      <Footer />
      <OrangeRain />
    </>
  )
}
