import { FEATURES } from '../data/content.js'
import { Reveal, SectionHeading } from './ui.jsx'

const ICONS = {
  book: (
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5ZM20 18v3H6.5M9 7.5h7M9 11h7" />
  ),
  refresh: (
    <path d="M20 11a8 8 0 1 0-2.3 6.3M20 5v6h-6" />
  ),
  cloud: (
    <path d="M7 18a4.5 4.5 0 1 1 .8-8.9 5.5 5.5 0 0 1 10.7 1.4A3.75 3.75 0 0 1 17.25 18H7Z" />
  ),
  chat: (
    <path d="M21 12a8 8 0 0 1-8 8H4l2.3-2.9A8 8 0 1 1 21 12ZM9 11h6M9 14.5h3.5" />
  ),
}

export default function Features() {
  return (
    <section id="learning" className="scroll-mt-20 bg-ice py-20 sm:py-24" aria-labelledby="learning-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Learning with BEICT"
            title={<span id="learning-title">Everything an A/L ICT student needs</span>}
            lead="From the first theory lesson to final revision — in class and online through the BEICT learning system."
          />
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 90}>
              <article className="group h-full rounded-2xl border border-brand-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-600/10">
                <span className="grid size-12 place-items-center rounded-xl bg-gradient-brand text-white shadow-md shadow-brand-600/30 transition-transform duration-300 group-hover:scale-110" aria-hidden>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-6"
                  >
                    {ICONS[feature.icon]}
                  </svg>
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-navy-800">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
