import { lazy, Suspense, useRef } from 'react'
import { useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import SmoothScroll from './scroll/SmoothScroll.jsx'
import Navbar from './components/Navbar.jsx'
import ZScrollTrack from './chapters/Chapters.jsx'
import LmsBanner from './components/LmsBanner.jsx'
import Banners from './components/Banners.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import OrangeRain from './components/OrangeRain.jsx'

const StageCanvas = lazy(() => import('./three/StageCanvas.jsx'))

export default function App() {
  const trackRef = useRef(null)
  const progressRef = useRef(0)
  const reduce = Boolean(useReducedMotion())

  // Progress across the 3D track only (0 at the hero, 1 as the gallery ends).
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  })
  // The 3D world reads plain refs (context doesn't cross the Canvas root).
  progressRef.current = scrollYProgress.get()
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    progressRef.current = v
  })

  return (
    <>
      <a
        href="#chapter-hero"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-brand-700 focus:shadow-lg"
      >
        Skip to content
      </a>
      <SmoothScroll />
      <Navbar />

      {/* The Z-scroll world */}
      <main id="main">
        <div ref={trackRef} className="relative">
          <ZScrollTrack progress={scrollYProgress} progressRef={progressRef} reduce={reduce} />
        </div>

        {/* Soft landing — back to light, normal flow */}
        <LmsBanner />
        <Banners />
        <Contact />
      </main>
      <Footer />
      <OrangeRain />
      
    </>
  )
}
