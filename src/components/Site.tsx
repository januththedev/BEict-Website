import { Fragment } from 'react'
import { useCms } from '../cms/CmsProvider'
import { SectionGate } from '../cms/edit'
import { ScrollProgress } from './ScrollProgress'
import { Navbar } from './Navbar'
import { Hero } from './Hero'
import { About } from './About'
import { Batches } from './Batches'
import { LmsSection } from './LmsSection'
import { PromoBanners } from './PromoBanners'
import { Community } from './Community'
import { Contact } from './Contact'
import { Footer } from './Footer'
import type { SectionId } from '../cms/schema'

function Section({ id }: { id: SectionId }) {
  switch (id) {
    case 'hero':
      return <Hero />
    case 'about':
      return <About />
    case 'batches':
      return <Batches />
    case 'lms':
      return <LmsSection />
    case 'promos':
      return <PromoBanners />
    case 'community':
      return <Community />
    case 'contact':
      return <Contact />
    default:
      return null
  }
}

/** The full public page, rendered from CMS state. */
export function Site() {
  const cms = useCms()
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-brand-600 focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>
      <ScrollProgress />
      <Navbar />
      <main id="main">
        {cms.sectionOrder.map((id) => (
          <Fragment key={id}>
            <SectionGate id={id}>
              <Section id={id} />
            </SectionGate>
          </Fragment>
        ))}
      </main>
      <Footer />
    </>
  )
}
