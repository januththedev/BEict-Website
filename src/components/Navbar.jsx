import { useEffect, useRef, useState } from 'react'
import { NAV_LINKS, SITE } from '../data/content.js'
import { Button } from './ui.jsx'

function Logo() {
  return (
    <a href="#home" className="flex items-center gap-2.5" aria-label="BEICT — home">
      <span
        className="grid size-10 place-items-center rounded-xl bg-gradient-brand font-display text-sm font-extrabold text-white shadow-md shadow-brand-600/30"
        aria-hidden
      >
        BE
      </span>
      {/* The original BEICT mark — together with the monogram it reads “BE·ICT”. */}
      <img
        src="/images/beict-logo.png"
        alt="G.C.E. A/L ICT — BEICT logo"
        width="74"
        height="41"
        className="h-10 w-auto"
      />
      <span className="sr-only">BEICT — Bhanuka Ekanayaka ICT</span>
    </a>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('home')
  const headerRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll-spy: highlight the nav link of the section in view.
  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href.slice(1))
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const linkCls = (href) => {
    const isActive = active === href.slice(1)
    return `relative rounded-md px-1 py-2 text-sm font-medium transition-colors ${
      isActive ? 'text-brand-700' : 'text-slate-600 hover:text-brand-700'
    } after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:rounded-full after:bg-gradient-brand after:transition-all after:duration-300 ${
      isActive ? 'after:w-full' : 'after:w-0'
    }`
  }

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        className={`mx-auto flex h-16 max-w-6xl items-center justify-between rounded-2xl border px-4 shadow-[0_8px_32px_-12px_rgba(12,27,58,0.18)] backdrop-blur-xl transition-colors duration-300 sm:px-6 ${
          scrolled || open
            ? 'border-white/70 bg-white/70'
            : 'border-white/50 bg-white/40'
        }`}
        aria-label="Main navigation"
      >
        <Logo />

        {/* Desktop links */}
        <ul className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={linkCls(link.href)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden lg:block">
          <Button
            href={SITE.lmsUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="primary"
            className="px-5 py-2.5"
          >
            LMS Login
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="grid size-11 place-items-center rounded-lg text-ink transition-colors hover:bg-brand-50 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu panel — glass, attached to the pill */}
      {open && (
        <div
          id="mobile-menu"
          className="mx-auto mt-2 max-w-6xl rounded-2xl border border-white/60 bg-white/70 shadow-[0_8px_32px_-12px_rgba(12,27,58,0.18)] backdrop-blur-xl lg:hidden"
        >
          <ul className="space-y-1 px-4 py-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-3 text-base font-medium transition-colors ${
                    active === link.href.slice(1)
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <Button
                href={SITE.lmsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="w-full"
              >
                LMS Login
              </Button>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
