import { useEffect, useState } from 'react'
import { NAV_LINKS, SITE } from '../data/content'
import { Logo } from './Logo'
import { ArrowUpRightIcon, CloseIcon, MenuIcon } from './Icons'

const lmsLinkProps = {
  href: SITE.lmsUrl,
  target: '_blank',
  rel: 'noopener noreferrer',
} as const

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeHref, setActiveHref] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scrollspy: highlight the nav link of the section currently in view
  useEffect(() => {
    const sections = NAV_LINKS.map((l) => document.getElementById(l.href.slice(1))).filter(
      (el): el is HTMLElement => el !== null,
    )
    if (sections.length === 0 || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveHref(`#${entry.target.id}`)
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-shadow duration-200 ${
        scrolled || open ? 'bg-white/95 shadow-sm backdrop-blur' : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#home" className="rounded-md" aria-label="BEICT — back to top">
          <Logo />
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={activeHref === link.href ? 'true' : undefined}
              className={`relative text-sm font-medium transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:rounded-full after:bg-brand-600 after:transition-all ${
                activeHref === link.href
                  ? 'text-brand-700 after:w-full'
                  : 'text-slate-body after:w-0 hover:text-brand-700'
              }`}
            >
              {link.label}
            </a>
          ))}
          <a {...lmsLinkProps} className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-card transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lift active:translate-y-0">
            LMS Login
            <ArrowUpRightIcon className="h-4 w-4" />
            <span className="sr-only">(opens lms.beict.lk in a new tab)</span>
          </a>
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div id="mobile-menu" hidden={!open} className="border-t border-slate-100 bg-white md:hidden">
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6" aria-label="Mobile">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-4 py-3 text-base font-medium text-ink transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              {link.label}
            </a>
          ))}
          <a
            {...lmsLinkProps}
            className="mt-2 inline-flex items-center justify-between rounded-lg bg-brand-600 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-700"
          >
            <span>LMS Login</span>
            <span className="flex items-center gap-1 text-sm font-medium text-brand-100">
              lms.beict.lk <ArrowUpRightIcon className="h-4 w-4" />
            </span>
          </a>
        </nav>
      </div>
    </header>
  )
}
