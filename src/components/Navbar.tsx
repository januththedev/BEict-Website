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
    const onScroll = () => setScrolled(window.scrollY > 24)
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
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="mx-auto max-w-6xl">
        {/* Floating pill */}
        <div
          className={`flex items-center justify-between gap-3 rounded-full border py-2 pl-4 pr-2 transition-all duration-300 sm:pl-5 ${
            scrolled || open
              ? 'border-white/70 bg-white/85 shadow-lift backdrop-blur-2xl'
              : 'border-white/50 bg-white/60 backdrop-blur-xl'
          }`}
        >
          <a href="#home" className="shrink-0 rounded-md" aria-label="BEICT — back to top">
            <Logo />
          </a>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
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
          </nav>

          <div className="flex items-center gap-2">
            <a
              {...lmsLinkProps}
              className="hidden items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-card transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lift active:translate-y-0 sm:inline-flex"
            >
              LMS Login
              <ArrowUpRightIcon className="h-4 w-4" />
              <span className="sr-only">(opens lms.beict.lk in a new tab)</span>
            </a>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-ink transition-colors hover:bg-brand-50 lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Floating glass menu card (mobile) */}
        {open && (
          <div
            id="mobile-menu"
            className="mt-2 rounded-3xl border border-white/70 bg-white/90 p-3 shadow-lift backdrop-blur-2xl lg:hidden"
          >
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-base font-medium transition-colors ${
                    activeHref === link.href
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-ink hover:bg-brand-50 hover:text-brand-700'
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <a
                {...lmsLinkProps}
                className="mt-1 inline-flex items-center justify-between rounded-2xl bg-brand-600 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-700"
              >
                <span>LMS Login</span>
                <span className="flex items-center gap-1 text-sm font-medium text-brand-100">
                  lms.beict.lk <ArrowUpRightIcon className="h-4 w-4" />
                </span>
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
