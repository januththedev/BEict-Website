import { SITE } from '../data/content'
import { ArrowUpRightIcon } from './Icons'
import { HeroCanvas } from './HeroCanvas'
import { BlurIn, TextReveal } from './TextReveal'
import { Reveal, btnGhost, btnPrimary } from './ui'

/** Faint blueprint-grid decoration behind the hero. Pure SVG/CSS, no image
 * payload; it doubles as the non-WebGL fallback under the canvas. */
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
      <HeroCanvas />
      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6 sm:pb-24 sm:pt-32">
        {/* Glass panel: keeps the headline readable over the WebGL field */}
        <Reveal>
          <div className="rounded-[2rem] border border-white/70 bg-white/60 p-6 shadow-lift backdrop-blur-2xl sm:p-10 lg:p-12">
            <BlurIn
              as="span"
              delay={150}
              className="inline-flex items-center gap-2 rounded-full border border-brand-200/80 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600" aria-hidden="true" />
              {SITE.level} · {SITE.medium}
            </BlurIn>

            <TextReveal
              as="p"
              delay={300}
              step={30}
              className="mt-5 font-accent text-2xl text-slate-body sm:text-3xl"
            >
              Information &amp; Communication Technology
            </TextReveal>
            <TextReveal
              as="h1"
              id="hero-title"
              delay={480}
              step={55}
              className="mt-1 max-w-3xl font-display text-4xl font-extrabold leading-[1.06] tracking-tight text-ink sm:text-6xl"
            >
              Learn it once.{' '}
              <span className="font-accent font-normal text-brand-600">
                Learn it with Bhanuka Ekanayaka.
              </span>
            </TextReveal>

            <BlurIn
              as="p"
              delay={950}
              className="mt-5 max-w-xl text-lg leading-relaxed text-slate-body"
            >
              A/L ICT in <span className="text-highlight font-medium text-ink">Sinhala medium</span> —
              in class, on YouTube, and in your pocket on{' '}
              <span className="text-highlight font-medium text-ink">lms.beict.lk</span>. You bring
              the effort; the structure is already here.
            </BlurIn>

            <BlurIn delay={1150} className="mt-7 flex flex-wrap items-center gap-3">
              <a href={SITE.lmsUrl} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
                Get Started Learning Now
                <ArrowUpRightIcon className="h-4 w-4" />
                <span className="sr-only">(opens lms.beict.lk in a new tab)</span>
              </a>
              <a href="#contact" className={btnGhost}>
                Contact Us
              </a>
            </BlurIn>

            <BlurIn
              as="p"
              delay={1300}
              className="mt-6 border-t border-white/70 pt-4 font-sinhala text-base text-slate-body"
            >
              {SITE.sinhalaLmsInvite}
            </BlurIn>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
