import { SITE } from '../data/content'
import { BookOpenIcon, MonitorIcon } from './Icons'
import { Reveal, SectionHeading } from './ui'

const FACTS = [
  {
    icon: BookOpenIcon,
    label: 'Subject',
    value: SITE.subject,
  },
  {
    icon: MonitorIcon,
    label: 'Online learning system',
    value: 'lms.beict.lk',
  },
]

export function About() {
  return (
    <section id="about" className="bg-white py-20 sm:py-24" aria-labelledby="about-title">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="About BEICT"
          title="ICT tuition, built around the A/L syllabus"
          lede="BEICT — Bhanuka Ekanayaka ICT — prepares G.C.E. Advanced Level students for Information & Communication Technology, taught in Sinhala medium, alongside a dedicated online learning system."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <Reveal className="flex flex-col justify-center gap-4 rounded-2xl border border-slate-100 bg-ice p-8">
            <h3 className="font-display text-xl font-bold text-ink">
              One teacher, one subject, done properly
            </h3>
            <p className="leading-relaxed">
              Every class and every online course focuses on a single goal: the G.C.E. Advanced
              Level Information &amp; Communication Technology examination. Lessons follow the
              national syllabus in Sinhala medium, so what you learn in class is exactly what you
              write in the exam hall.
            </p>
            <p className="leading-relaxed">
              Between physical classes, the BEICT learning system keeps lessons, resources and
              updates available online — so revision never has to wait for the next session.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <dl className="grid h-full grid-cols-1 gap-4">
              {FACTS.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-body">
                      {label}
                    </dt>
                    <dd className="mt-0.5 font-semibold text-ink">{value}</dd>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-4 rounded-2xl border border-brand-100 bg-brand-50 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 shadow-card">
                  <span className="font-display text-sm font-extrabold">A/L</span>
                </span>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                    Level &amp; medium
                  </dt>
                  <dd className="mt-0.5 font-semibold text-ink">
                    {SITE.level} · {SITE.medium}
                  </dd>
                </div>
              </div>
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
