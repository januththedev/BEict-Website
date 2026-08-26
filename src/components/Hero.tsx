import { SITE } from '../data/content'
import { ArrowUpRightIcon } from './Icons'
import { Reveal, btnGhost, btnPrimary } from './ui'

/** Faint blueprint-grid + circuit decoration behind the hero. Pure SVG/CSS,
 * no image payload; hidden from assistive tech and removed for small screens. */
function HeroBackdrop() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1200 600"
    >
      <defs>
        <pattern id="hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M48 0H0v48" fill="none" stroke="#dbe6fe" strokeWidth="1" />
        </pattern>
        <linearGradient id="hero-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="55%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="white" />
        </linearGradient>
        <radialGradient id="hero-glow" cx="78%" cy="30%" r="45%">
          <stop offset="0%" stopColor="#bfd3fe" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#bfd3fe" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="600" fill="url(#hero-glow)" />
      <rect width="1200" height="600" fill="url(#hero-grid)" />
      <path
        d="M870 120 h90 a14 14 0 0 1 14 14 v70 M974 300 v80 a14 14 0 0 1 -14 14 h-110"
        fill="none"
        stroke="#93b4fd"
        strokeWidth="1.6"
        strokeDasharray="3 7"
        strokeLinecap="round"
      />
      <circle cx="870" cy="120" r="5" fill="#1e4fd8" />
      <circle cx="850" cy="394" r="5" fill="#38bdf8" />
      <circle cx="974" cy="204" r="3.5" fill="#608ffa" />
      <rect width="1200" height="600" fill="url(#hero-fade)" />
    </svg>
  )
}

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden pt-16" aria-labelledby="hero-title">
      <HeroBackdrop />
      <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-24 lg:pt-28">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 shadow-card">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-600" aria-hidden="true" />
            {SITE.level} · {SITE.medium}
          </span>
        </Reveal>

        <Reveal delay={80}>
          <p className="font-display text-lg font-semibold text-brand-600">{SITE.subject}</p>
          <h1
            id="hero-title"
            className="max-w-3xl font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-6xl"
          >
            Learn ICT with{' '}
            <span className="bg-gradient-to-r from-brand-600 to-sky-500 bg-clip-text text-transparent">
              Bhanuka Ekanayaka
            </span>
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="max-w-xl text-lg leading-relaxed text-slate-body">
            BEICT prepares G.C.E. Advanced Level students in Sinhala medium — with classes and a
            complete online learning system at{' '}
            <span className="font-semibold text-ink">lms.beict.lk</span>.
          </p>
        </Reveal>

        <Reveal delay={240} className="flex flex-wrap items-center gap-3">
          <a
            href={SITE.lmsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={btnPrimary}
          >
            Get Started Learning Now
            <ArrowUpRightIcon className="h-4 w-4" />
            <span className="sr-only">(opens lms.beict.lk in a new tab)</span>
          </a>
          <a href="#contact" className={btnGhost}>
            Contact Us
          </a>
        </Reveal>

        <Reveal delay={320}>
          <p className="font-sinhala text-base text-slate-body">{SITE.sinhalaLmsInvite}</p>
        </Reveal>
      </div>
    </section>
  )
}
