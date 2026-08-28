import { Fragment, useEffect } from 'react'
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

/** Head manager. Mirrors the CMS site.seo* values to document.title, the
 * meta description, the OG tags, and the favicon <link> so admin edits to
 * the SEO & Brand section show up on the live site without a rebuild. */
function Seo() {
  const { seoTitle, seoDescription, seoFaviconUrl, seoOgImageUrl } = useCms().c.site

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (seoTitle) document.title = seoTitle

    const setMeta = (selector: string, attr: string, value: string) => {
      if (!value) return
      let el = document.head.querySelector<HTMLMetaElement>(selector)
      if (!el) {
        el = document.createElement('meta')
        const m = selector.match(/\["?([\w:-]+)"?\]/)
        if (m) el.setAttribute('name', m[1])
        else {
          const p = selector.match(/\["?([\w:-]+)"?\]/)
          if (p) el.setAttribute('property', p[1])
        }
        document.head.appendChild(el)
      }
      el.setAttribute(attr, value)
    }

    setMeta('meta[name="description"]', 'content', seoDescription)
    setMeta('meta[property="og:title"]', 'content', seoTitle)
    setMeta('meta[property="og:description"]', 'content', seoDescription)
    setMeta('meta[property="og:image"]', 'content', seoOgImageUrl)
    setMeta('meta[name="twitter:title"]', 'content', seoTitle)
    setMeta('meta[name="twitter:description"]', 'content', seoDescription)
    setMeta('meta[name="twitter:image"]', 'content', seoOgImageUrl)

    if (seoFaviconUrl) {
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]')
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', 'icon')
        document.head.appendChild(link)
      }
      link.setAttribute('href', seoFaviconUrl)
    }
  }, [seoTitle, seoDescription, seoFaviconUrl, seoOgImageUrl])

  return null
}

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
      <Seo />
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
