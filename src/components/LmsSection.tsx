import { SITE } from '../data/content'
import { ArrowUpRightIcon } from './Icons'
import { Reveal, SectionHeading } from './ui'

const POINTS = [
  {
    title: 'Courses organised by exam batch',
    body: 'A/L ICT courses are arranged by examination year and a dedicated repeat-revision track.',
  },
  {
    title: 'Calendar & announcements',
    body: 'Class dates and updates are published inside the learning system calendar.',
  },
  {
    title: 'Your student account',
    body: 'Sign in with your BEICT student account to reach your lessons and resources.',
  },
]

export function LmsSection() {
  return (
    <section id="lms" className="relative overflow-hidden bg-navy-900 py-20 sm:py-24" aria-labelledby="lms-title">
      {/* subtle dark grid backdrop */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.14]"
        aria-hidden="true"
        viewBox="0 0 1200 400"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="lms-grid" width="44" height="44" patternUnits="userSpaceOnUse">
            <path d="M44 0H0v44" fill="none" stroke="#608ffa" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1200" height="400" fill="url(#lms-grid)" />
      </svg>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
          <div className="flex flex-col gap-6">
            <SectionHeading
              align="left"
              dark
              eyebrow="BICT Online"
              title="The BEICT Online Learning System"
              lede="The classroom doesn't close when the lesson ends. lms.beict.lk is where BEICT students find their courses, materials and updates — from anywhere."
            />
            <Reveal delay={140}>
              <p className="font-sinhala text-lg leading-relaxed text-brand-100">
                {SITE.sinhalaLmsInvite}
              </p>
            </Reveal>
            <Reveal delay={200} className="flex flex-wrap items-center gap-4">
              <a
                href={SITE.lmsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-brand-700 shadow-lift transition-all hover:-translate-y-0.5 hover:bg-brand-50 active:translate-y-0"
              >
                Open the Learning System
                <ArrowUpRightIcon className="h-4 w-4" />
                <span className="sr-only">(opens lms.beict.lk in a new tab)</span>
              </a>
              <span className="font-mono text-sm text-brand-200">lms.beict.lk</span>
            </Reveal>
          </div>

          <ul className="grid gap-4">
            {POINTS.map((point, i) => (
              <Reveal key={point.title} delay={i * 90}>
                <li className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <p className="font-semibold text-white">{point.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-brand-100/80">{point.body}</p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
