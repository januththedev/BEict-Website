import { useCms } from '../cms/CmsProvider'
import { T } from '../cms/edit'
import { ArrowUpRightIcon } from './Icons'
import { HeroCanvas } from './HeroCanvas'
import { BlurIn, TextReveal } from './TextReveal'
import { Reveal, btnGhost, btnPrimary } from './ui'

/** Faint blueprint-grid decoration behind the hero; doubles as the
 * non-WebGL fallback under the canvas. */
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
  const cms = useCms()
  const { c, edit } = cms
  const h = c.hero

  return (
    <section id="home" className="relative overflow-hidden pt-16" aria-labelledby="hero-title">
      <HeroBackdrop />
      <HeroCanvas />
      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6 sm:pb-24 sm:pt-32">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-white/25 shadow-lift backdrop-blur-2xl backdrop-saturate-150">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/45 via-transparent to-sky-100/25"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/30 blur-3xl"
            />
            <div className="relative p-6 sm:p-10 lg:p-12">
              <BlurIn
                as="span"
                delay={150}
                className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 backdrop-blur-xl"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-brand-600" aria-hidden="true" />
                {edit ? <T p="hero.badge" /> : h.badge}
              </BlurIn>

              {edit ? (
                <T p="hero.subject" as="p" className="mt-5 block font-display text-lg font-semibold text-brand-600" />
              ) : (
                <TextReveal
                  as="p"
                  variant="letters"
                  delay={350}
                  step={22}
                  className="mt-5 block font-display text-lg font-semibold text-brand-600"
                >
                  {h.subject}
                </TextReveal>
              )}

              {edit ? (
                <h1 id="hero-title" className="mt-1 max-w-3xl font-display text-4xl font-extrabold leading-[1.06] tracking-tight text-ink sm:text-6xl">
                  <T p="hero.titlePre" />{' '}
                  <span className="text-gradient-brand">
                    <T p="hero.titleName" />
                  </span>
                </h1>
              ) : (
                <TextReveal
                  as="h1"
                  id="hero-title"
                  delay={480}
                  step={55}
                  className="mt-1 max-w-3xl font-display text-4xl font-extrabold leading-[1.06] tracking-tight text-ink sm:text-6xl"
                >
                  {h.titlePre} <span className="text-gradient-brand">{h.titleName}</span>
                </TextReveal>
              )}

              <BlurIn as="p" delay={950} className="mt-5 max-w-xl text-lg leading-relaxed text-slate-body">
                <T p="hero.ledePre" />{' '}
                <a href={h.ledeLinkHref} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink">
                  <T p="hero.ledeLinkLabel" />
                </a>
                {h.ledePost ? <> {<T p="hero.ledePost" />}</> : null}
              </BlurIn>

              <BlurIn delay={1150} className="mt-7 flex flex-wrap items-center gap-3">
                <a href={h.primaryCta.href} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
                  {edit ? <T p="hero.primaryCta.label" /> : h.primaryCta.label}
                  <ArrowUpRightIcon className="h-4 w-4" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
                <a href="#contact" className={btnGhost}>
                  {edit ? <T p="hero.secondaryCtaLabel" /> : h.secondaryCtaLabel}
                </a>
              </BlurIn>

              <BlurIn
                as="p"
                delay={1300}
                className="mt-6 border-t border-white/50 pt-4 font-sinhala text-base text-slate-body"
              >
                {edit ? <T p="hero.sinhala" /> : h.sinhala}
              </BlurIn>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
