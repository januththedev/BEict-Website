import { lazy, Suspense } from 'react'
import { HERO_CHIPS, SITE } from '../data/content.js'
import { Button, Reveal } from './ui.jsx'

const HeroScene = lazy(() => import('../three/HeroScene.jsx'))

function SceneFallback() {
  return (
    <div className="grid size-full place-items-center" aria-hidden>
      <div className="relative grid size-56 place-items-center rounded-full bg-gradient-to-br from-brand-500/15 to-cyan-400/15">
        <div className="absolute inset-6 rounded-full border border-brand-200/70" />
        <svg viewBox="0 0 64 64" className="size-24 text-brand-600" fill="none">
          <rect x="18" y="18" width="28" height="28" rx="4" stroke="currentColor" strokeWidth="2.5" />
          <rect x="26" y="26" width="12" height="12" rx="2" fill="currentColor" opacity="0.25" />
          {[22, 32, 42].map((p) => (
            <g key={p} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d={`M${p} 10v8M${p} 46v8`} />
              <path d={`M10 ${p}h8M46 ${p}h8`} />
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden pt-16" aria-labelledby="hero-title">
      {/* Backdrop decoration */}
      <div className="grid-backdrop absolute inset-0" aria-hidden />
      <div className="glow-orb left-[-120px] top-[10%] size-[380px] bg-brand-400/25" aria-hidden />
      <div
        className="glow-orb right-[-140px] top-[45%] size-[420px] bg-cyan-300/25"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-14 pt-12 sm:px-6 lg:min-h-[calc(100vh-4rem)] lg:grid-cols-2 lg:gap-6 lg:pb-20 lg:pt-16 lg:px-8">
        {/* Copy */}
        <div className="max-w-xl">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-brand-700">
              <span className="size-1.5 animate-pulse rounded-full bg-brand-600" aria-hidden />
              G.C.E. Advanced Level · ICT Classes
            </p>
          </Reveal>

          <Reveal delay={80}>
            <h1
              id="hero-title"
              className="mt-5 font-display text-4xl leading-[1.08] font-extrabold tracking-tight text-ink sm:text-5xl xl:text-6xl"
            >
              Information &amp; <span className="text-gradient-brand">Communication</span>{' '}
              Technology
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-4 font-display text-lg font-semibold text-brand-800">
              Conducted by {SITE.owner}
              <span className="block text-sm font-medium text-slate-500">
                “{SITE.tagline}”
              </span>
            </p>
            <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
              Clear explanations, structured theory and focused revision — in six
              class hubs across the island and online through the BEICT learning
              system.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Button
                href={SITE.lmsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-3.5 text-base"
              >
                Get Started Learning Now
                <svg viewBox="0 0 20 20" fill="none" className="size-4.5" aria-hidden>
                  <path
                    d="M4 10h11m0 0-4-4m4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
              <Button href="#contact" variant="secondary" className="px-7 py-3.5 text-base">
                Contact Bhanuka Sir
              </Button>
            </div>
            <p className="mt-3 font-sinhala text-sm text-slate-500">
              {SITE.sinhalaLmsInvite}
            </p>
          </Reveal>

          {/* Verified class-type chips */}
          <Reveal delay={320}>
            <ul className="mt-9 flex flex-wrap gap-2.5" aria-label="What BEICT covers">
              {HERO_CHIPS.map((chip) => (
                <li
                  key={chip}
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-navy-800 shadow-sm"
                >
                  <svg viewBox="0 0 16 16" className="size-3.5 text-brand-600" aria-hidden>
                    <path
                      d="M3 8.5 6.5 12 13 4.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {chip}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Interactive 3D chip */}
        <Reveal delay={200} className="relative mx-auto h-[340px] w-full max-w-[520px] sm:h-[420px] lg:h-[520px]">
          <div
            className="absolute inset-8 rounded-full bg-gradient-to-br from-brand-500/20 via-transparent to-cyan-300/25 blur-2xl"
            aria-hidden
          />
          <Suspense fallback={<SceneFallback />}>
            <HeroScene />
          </Suspense>
        </Reveal>
      </div>
    </section>
  )
}
