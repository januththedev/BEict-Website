import { SITE } from '../data/content.js'
import { Button, Reveal, SectionHeading } from './ui.jsx'

const POINTS = [
  {
    title: 'Structured theory',
    body: 'Lessons organised to follow the A/L ICT syllabus step by step.',
  },
  {
    title: 'Focused revision',
    body: 'Dedicated revision classes ahead of the examination.',
  },
  {
    title: 'Online learning system',
    body: 'The BEICT අන්තර්ජාල ඉගෙනුම් පද්ධතිය extends lessons beyond the classroom.',
  },
]

export default function About() {
  return (
    <section id="about" className="scroll-mt-20 py-20 sm:py-24" aria-labelledby="about-title">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Portrait card */}
        <Reveal className="order-2 mx-auto w-full max-w-md lg:order-1">
          <div className="relative">
            <div
              className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-brand-500/25 to-cyan-400/25 blur-xl"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-brand-100 bg-gradient-to-b from-brand-100 via-brand-50 to-cyan-100 shadow-xl shadow-brand-900/10">
              {/* Real photograph is used when available; otherwise this
                  placeholder stands in until the photo is added. */}
              <img
                src="/images/bhanuka-sir.png"
                alt={`Portrait of ${SITE.owner}, ICT teacher`}
                width="480"
                height="600"
                loading="lazy"
                className="aspect-[4/5] w-full object-contain object-bottom"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                }}
              />
              <div className="hidden aspect-[4/5] w-full flex-col items-center justify-center gap-4 p-8 text-center">
                <span className="grid size-28 place-items-center rounded-full bg-gradient-brand font-display text-4xl font-extrabold text-white shadow-lg">
                  BS
                </span>
                <p className="font-display text-lg font-semibold text-navy-800">{SITE.owner}</p>
                <p className="text-sm text-slate-500">
                  Photo coming soon — add it at public/images/bhanuka-sir.png
                </p>
              </div>
            </div>
            <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-brand-100 bg-white px-5 py-2.5 shadow-lg whitespace-nowrap">
              <span className="size-2 rounded-full bg-emerald-500" aria-hidden />
              <span className="text-sm font-semibold text-navy-800">“Bhanuka Sir”</span>
            </div>
          </div>
        </Reveal>

        {/* Bio */}
        <div className="order-1 lg:order-2">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="About"
              title={<span id="about-title">Meet Bhanuka Sir</span>}
              lead={`${SITE.owner} teaches ${SITE.subject} for ${SITE.level} students, with classes built around clear explanations and exam-focused practice.`}
            />
          </Reveal>
          <Reveal delay={120}>
            <ul className="mt-8 space-y-5">
              {POINTS.map((point) => (
                <li key={point.title} className="flex gap-4">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100" aria-hidden>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="size-5">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.7-9.3a1 1 0 0 0-1.4-1.4L9 10.6 7.7 9.3a1 1 0 0 0-1.4 1.4l2 2a1 1 0 0 0 1.4 0l4-4Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <div>
                    <p className="font-display font-semibold text-navy-800">{point.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{point.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-9 flex flex-wrap gap-3.5">
              <Button href="#learning" variant="primary">
                Explore the Classes
              </Button>
              <Button href={SITE.lmsUrl} target="_blank" rel="noopener noreferrer" variant="secondary">
                Visit the LMS
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
