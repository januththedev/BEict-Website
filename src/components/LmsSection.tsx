import { useCms } from '../cms/CmsProvider'
import { AddItemButton, ItemControls, Link, T } from '../cms/edit'
import { ArrowUpRightIcon } from './Icons'
import { Reveal, SectionHeading } from './ui'

export function LmsSection() {
  const cms = useCms()
  const l = cms.c.lms

  return (
    <section id="lms" className="relative overflow-hidden bg-navy-900 py-20 sm:py-24" aria-labelledby="lms-title">
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
              id="lms-title"
              align="left"
              dark
              eyebrow="BICT Online"
              titleKey="lms.title"
              ledeKey="lms.lede"
              variant="scale"
            />
            <Reveal delay={140}>
              <T p="lms.sinhala" as="p" className="block font-sinhala text-lg leading-relaxed text-brand-100" />
            </Reveal>
            <Reveal delay={200} className="flex flex-wrap items-center gap-4">
              <Link
                hrefPath="site.lmsUrl"
                fallback={cms.c.site.lmsUrl}
                external
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-brand-700 shadow-lift transition-all hover:-translate-y-0.5 hover:bg-brand-50 active:translate-y-0"
              >
                <T p="lms.ctaLabel" />
                <ArrowUpRightIcon className="h-4 w-4" />
                <span className="sr-only">(opens lms.beict.lk in a new tab)</span>
              </Link>
              <span className="font-mono text-sm text-brand-200">lms.beict.lk</span>
            </Reveal>
          </div>

          <ul className="grid gap-4">
            {l.points.map((_, i) => (
              <Reveal key={i} delay={i * 90}>
                <li className="cms-item relative rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <ItemControls path={`lms.points.${i}`} removable={l.points.length > 1} />
                  <T p={`lms.points.${i}.title`} as="p" className="block font-semibold text-white" />
                  <T p={`lms.points.${i}.body`} as="p" multiline className="mt-1 block text-sm leading-relaxed text-brand-100/80" />
                </li>
              </Reveal>
            ))}
            <AddItemButton
              listPath="lms.points"
              template={{ title: 'New point', body: 'Describe this feature of the learning system.' }}
              label="Add point"
            />
          </ul>
        </div>
      </div>
    </section>
  )
}
