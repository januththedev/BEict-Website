import { useState } from 'react'
import { BANNERS } from '../data/content.js'
import { Reveal, SectionHeading } from './ui.jsx'

function Banner({ banner }) {
  const [imageOk, setImageOk] = useState(true)

  return (
    <a
      href={banner.href}
      target={banner.target ?? undefined}
      rel={banner.target === '_blank' ? 'noopener noreferrer' : undefined}
      aria-label={banner.label}
      className="group relative block overflow-hidden rounded-2xl border border-brand-100 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-600/20"
    >
      {imageOk ? (
        <img
          src={banner.image}
          alt={banner.label}
          width="800"
          height="300"
          loading="lazy"
          onError={() => setImageOk(false)}
          className="aspect-[8/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        /* Built-in promo design — shown until banner-<id>.jpg is dropped in. */
        <span className="relative flex aspect-[8/3] w-full items-center bg-gradient-to-br from-brand-700 via-brand-600 to-cyan-500">
          <span
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 85% 20%, rgba(255,255,255,0.55) 0, transparent 45%), radial-gradient(circle at 15% 90%, rgba(255,255,255,0.35) 0, transparent 40%)',
            }}
            aria-hidden
          />
          <span className="relative z-10 flex h-full flex-col justify-center gap-1 p-5 sm:p-7">
            <span className="text-[11px] font-semibold tracking-[0.22em] text-cyan-100 uppercase">
              {banner.eyebrow}
            </span>
            <span className="font-display text-lg font-extrabold leading-tight text-white sm:text-xl">
              {banner.title}
            </span>
            <span className="mt-1 text-xs text-brand-50/85 sm:text-sm">{banner.note}</span>
            <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-xs font-bold text-brand-700 shadow">
              Learn more →
            </span>
          </span>
        </span>
      )}
    </a>
  )
}

/**
 * Three swappable ad slots. Drop the same creatives used on social media
 * into public/images/banners/banner-1.jpg … banner-3.jpg.
 */
export default function Banners() {
  return (
    <section className="py-20 sm:py-24" aria-labelledby="banners-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow='Announcements'
            title={<span id="banners-title">Latest from BEICT</span>}
            lead="Seminars, new batches and online events — tap through for details."
          />
        </Reveal>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {BANNERS.map((banner, i) => (
            <Reveal key={banner.id} delay={i * 100}>
              <Banner banner={banner} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
