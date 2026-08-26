import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { Batches } from './components/Batches'
import { LmsSection } from './components/LmsSection'
import { PromoBanners } from './components/PromoBanners'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'

export default function App() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-brand-600 focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <Batches />
        <LmsSection />
        <PromoBanners />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
