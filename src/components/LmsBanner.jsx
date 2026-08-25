import { SITE } from '../data/content.js'
import { Button, Reveal } from './ui.jsx'

export default function LmsBanner() {
  return (
    <section className="relative overflow-hidden bg-navy-900 py-16 sm:py-20" aria-labelledby="lms-title">
      {/* Decorative glows */}
      <div className="glow-orb left-[8%] top-[-60px] size-[300px] bg-brand-600/40" aria-hidden />
      <div className="glow-orb bottom-[-80px] right-[6%] size-[340px] bg-cyan-500/30" aria-hidden />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 text-center sm:px-6 lg:flex-row lg:justify-between lg:text-left lg:px-8">
        <Reveal>
          <p className="font-display text-xs font-semibold tracking-[0.2em] text-brand-200 uppercase">
            BEICT Online Learning System
          </p>
          <h2
            id="lms-title"
            className="mt-3 font-sinhala text-2xl font-semibold leading-snug text-white sm:text-3xl"
          >
            {SITE.sinhalaLmsInvite}
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-brand-100/75">
            Lessons and resources live in the BEICT online learning system — sign in at{' '}
            <span className="font-semibold text-white">lms.beict.lk</span> and keep learning any
            time, from anywhere.
          </p>
        </Reveal>

        <Reveal delay={140} className="shrink-0">
          <Button
            href={SITE.lmsUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="white"
            className="px-8 py-4 text-base"
          >
            Get Started Learning Now
            <svg viewBox="0 0 20 20" fill="none" className="size-5" aria-hidden>
              <path
                d="M4 10h11m0 0-4-4m4 4-4 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </Reveal>
      </div>
    </section>
  )
}
