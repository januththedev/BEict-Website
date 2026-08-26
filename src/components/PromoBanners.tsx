import { PROMOS } from '../data/content'
import { ArrowUpRightIcon } from './Icons'
import { Reveal, SectionHeading } from './ui'

export function PromoBanners() {
  return (
    <section className="bg-white py-20 sm:py-24" aria-labelledby="promos-title">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Stay connected"
          title="Never miss an update"
          lede="Announcements, online lessons and new-batch news — three places to keep up with BEICT."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PROMOS.map((promo, i) => (
            <Reveal key={promo.id} delay={i * 90} className="h-full">
              <a
                href={promo.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
                aria-label={`${promo.linkLabel} (opens in a new tab)`}
              >
                <img
                  src={promo.image}
                  alt={promo.alt}
                  width={1200}
                  height={400}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[3/1] w-full object-cover"
                />
                <span className="flex flex-1 flex-col gap-2 p-6">
                  <span className="font-display text-base font-bold text-ink">{promo.title}</span>
                  <span className="text-sm leading-relaxed">{promo.desc}</span>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-brand-700">
                    {promo.linkLabel}
                    <ArrowUpRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
