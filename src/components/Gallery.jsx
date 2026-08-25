import { useState } from 'react'
import { GALLERY_CAPTIONS } from '../data/content.js'
import { Reveal, SectionHeading } from './ui.jsx'

function GalleryItem({ index, caption }) {
  const [failed, setFailed] = useState(false)
  const src = `/images/gallery/${index + 1}.jpg`

  return (
    <figure className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-cyan-50 shadow-sm">
      {failed ? (
        <figcaption className="flex h-full flex-col items-center justify-center gap-2.5 p-4 text-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-8 text-brand-300" aria-hidden>
            <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.6a1 1 0 0 0 .83-.45l.74-1.1A1 1 0 0 1 9.5 4h5a1 1 0 0 1 .83.45l.74 1.1a1 1 0 0 0 .83.45h1.6A2.5 2.5 0 0 1 21 8.5v9A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-9Z" />
            <circle cx="12" cy="12.5" r="3.25" />
          </svg>
          <span className="text-sm font-semibold text-navy-800">{caption}</span>
          <span className="text-xs text-slate-500">Photo coming soon</span>
        </figcaption>
      ) : (
        <>
          <img
            src={src}
            alt={caption}
            loading="lazy"
            width="640"
            height="480"
            onError={() => setFailed(true)}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/80 to-transparent px-4 pb-3 pt-10 text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {caption}
          </figcaption>
        </>
      )}
    </figure>
  )
}

export default function Gallery() {
  return (
    <section id="gallery" className="scroll-mt-20 py-20 sm:py-24" aria-labelledby="gallery-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Gallery"
            title={<span id="gallery-title">Inside the classroom</span>}
            lead="Moments from BEICT classes — theory, revision and everything in between."
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {GALLERY_CAPTIONS.map((caption, i) => (
            <Reveal key={`${caption}-${i}`} delay={(i % 4) * 70}>
              <GalleryItem index={i} caption={caption} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
