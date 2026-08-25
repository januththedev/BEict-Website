import { SITE, SOCIAL_STATS, VENUES } from '../data/content.js'
import { Reveal, SectionHeading } from './ui.jsx'

const ICONS = {
  facebook: (
    <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2.1-.1-2.1 0-3.6 1.3-3.6 3.7V11H8.3v3h2.4v7h2.8Z" />
  ),
  youtube: (
    <path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.9C18.2 5 12 5 12 5s-6.2 0-7.8.3A2.6 2.6 0 0 0 2.4 7.2 27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.9c1.6.3 7.8.3 7.8.3s6.2 0 7.8-.3a2.6 2.6 0 0 0 1.8-1.9A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8ZM10 15.2V8.8l5.2 3.2L10 15.2Z" />
  ),
  tiktok: (
    <path d="M16.6 3c.4 2 1.7 3.4 3.9 3.6v2.8c-1.4.1-2.7-.3-3.9-1v5.9c0 4.2-3.1 6.2-6 5.6-2.6-.5-4.4-2.8-4.3-5.4.2-3 2.7-5 5.9-4.7v2.9c-1.5-.3-2.9.4-3 1.9-.1 1.2.8 2.2 2 2.3 1.3.1 2.4-.9 2.4-2.4V3h3Z" />
  ),
  pin: (
    <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
  ),
}

function StatCard({ stat }) {
  const Comp = stat.href.startsWith('#') ? 'a' : 'a'
  return (
    <Comp
      href={stat.href}
      target={stat.href.startsWith('http') ? '_blank' : undefined}
      rel={stat.href.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="group flex flex-col items-center rounded-2xl border border-brand-100 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-600/10"
    >
      <span className="grid size-12 place-items-center rounded-xl bg-gradient-brand text-white shadow-md shadow-brand-600/25 transition-transform duration-300 group-hover:scale-110" aria-hidden>
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-6">
          {ICONS[stat.icon]}
        </svg>
      </span>
      <span className="mt-4 font-display text-3xl font-extrabold tracking-tight text-navy-800">
        {stat.value}
      </span>
      <span className="mt-1 text-sm font-semibold text-slate-600">{stat.label}</span>
      {stat.sub && <span className="text-xs text-slate-400">{stat.sub}</span>}
    </Comp>
  )
}

export default function Community() {
  return (
    <section
      id="community"
      className="scroll-mt-20 bg-ice py-20 sm:py-24"
      aria-labelledby="community-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow='The BEICT community'
            title={<span id="community-title">A quarter of a million learners follow along</span>}
            lead="Class announcements, ICT insights and exam motivation — posted where Sri Lankan students already are."
          />
        </Reveal>

        <div className="mt-12 grid gap-5 grid-cols-2 lg:grid-cols-4">
          {SOCIAL_STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 80}>
              <StatCard stat={stat} />
            </Reveal>
          ))}
        </div>

        {/* Physical class hubs */}
        <div id="venues" className="scroll-mt-28 pt-20">
          <Reveal>
            <SectionHeading
              title={<span>Six class hubs, one island-wide network</span>}
              lead="Walk into any of these halls for a live class with Bhanuka Sir — or join online from anywhere."
            />
          </Reveal>
          <ul className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {VENUES.map((venue, i) => (
              <Reveal key={venue.name} delay={(i % 3) * 70}>
                <li className="flex items-center gap-3 rounded-xl border border-brand-100 bg-white px-4 py-3.5 shadow-sm">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-brand-100" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                      {ICONS.pin}
                    </svg>
                  </span>
                  <span>
                    <span className="block font-display text-sm font-bold text-navy-800">{venue.name}</span>
                    <span className="block text-xs text-slate-500">{venue.town}</span>
                  </span>
                </li>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={200}>
            <p className="mt-8 text-center text-sm text-slate-500">
              Class times &amp; registration for each hall are announced on{' '}
              <a href={SITE.facebookUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 underline decoration-brand-200 underline-offset-2 hover:decoration-brand-500">
                Facebook
              </a>{' '}
              and the{' '}
              <a href={SITE.telegramUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 underline decoration-brand-200 underline-offset-2 hover:decoration-brand-500">
                BEICT Telegram community
              </a>
              .
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
