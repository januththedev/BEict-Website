import { useEffect, useState } from 'react'
import { useCms } from '../cms/CmsProvider'
import { Logo } from './Logo'
import { ArrowUpRightIcon, CloseIcon, MenuIcon } from './Icons'

export function Navbar() {
  const cms = useCms()
  const { c } = cms
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeHref, setActiveHref] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = c.nav.links
      .map((l) => document.getElementById(l.href.slice(1)))
      .filter((el): el is HTMLElement => el !== null)
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
  }, [c.nav.links])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  const lmsLinkProps = {
    href: c.site.lmsUrl,
    target: '_blank',
    rel: 'noopener noreferrer',
  } as const

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-2.5 sm:px-6 sm:pt-3">
      <div className="mx-auto max-w-6xl">
        <div
          className={`flex items-center justify-between gap-3 rounded-full border py-1.5 pl-3.5 pr-1.5 backdrop-saturate-150 transition-all duration-300 sm:pl-4 ${
            scrolled || open
              ? 'border-white/60 bg-white/70 shadow-lift backdrop-blur-2xl'
              : 'border-white/40 bg-white/30 backdrop-blur-xl'
          }`}
        >
          <a href="#home" className="shrink-0 rounded-md" aria-label="BEICT — back to top">
            <Logo compact />
          </a>

          <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary">
            {c.nav.links.map((link) => (
              <a
                key={link.href + link.label}
                href={link.href}
                aria-current={activeHref === link.href ? 'true' : undefined}
                className={`relative text-[13px] font-medium transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:rounded-full after:bg-brand-600 after:transition-all ${
                  activeHref === link.href
                    ? 'text-brand-700 after:w-full'
                    : 'text-slate-body after:w-0 hover:text-brand-700'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <a
              {...lmsLinkProps}
              className="hidden items-center gap-1 rounded-full bg-brand-600 px-3.5 py-1.5 text-[13px] font-semibold text-white shadow-card transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lift active:translate-y-0 sm:inline-flex"
            >
              {c.site.lmsLabel}
              <ArrowUpRightIcon className="h-3.5 w-3.5" />
              <span className="sr-only">(opens lms.beict.lk in a new tab)</span>
            </a>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-ink transition-colors hover:bg-brand-50 lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <CloseIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {open && (
          <div
            id="mobile-menu"
            className="mt-2 rounded-3xl border border-white/50 bg-white/70 p-2 shadow-lift backdrop-blur-2xl backdrop-saturate-150 lg:hidden"
          >
            <nav className="flex flex-col gap-0.5" aria-label="Mobile">
              {c.nav.links.map((link) => (
                <a
                  key={link.href + link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-2xl px-4 py-2.5 text-[15px] font-medium transition-colors ${
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
                className="mt-1 inline-flex items-center justify-between rounded-2xl bg-brand-600 px-4 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-brand-700"
              >
                <span>{c.site.lmsLabel}</span>
                <span className="flex items-center gap-1 text-[13px] font-medium text-brand-100">
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
