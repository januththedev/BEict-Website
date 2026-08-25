import { lazy, Suspense, useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CHAPTERS, SITE, TRACK_VH, VENUES, mapsUrlFor } from '../data/content.js'
import { Button } from '../components/ui.jsx'

/**
 * Product-Launch chapters: one hero object in a void per chapter, sparse
 * huge typography, sequenced line beats. No cards — text floats on black.
 * Panels write styles from the shared progress MotionValue directly.
 */

const StageCanvas = lazy(() => import('../three/StageCanvas.jsx'))

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const smooth = (v) => {
  const t = clamp01(v)
  return t * t * (3 - 2 * t)
}

/** Sequenced line: fades/translates in during its slice of the chapter. */
function Beat({ progress, chapter, index, count, className = '', children, as: Tag = 'p' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const { start, end } = chapter
    const span = end - start
    const slot = span / count
    // The first beat is fully visible the moment the chapter begins.
    const a = start + (index === 0 ? -slot : index * slot)
    const b = a + slot * 1.6
    const apply = (p) => {
      const o = smooth((p - a) / (slot * 0.5)) * (1 - smooth((p - (end - span * 0.06)) / (span * 0.1)))
      const y = (1 - smooth((p - a) / (slot * 0.5))) * 34
      el.style.opacity = clamp01(o).toFixed(3)
      el.style.transform = `translateY(${y.toFixed(1)}px)`
    }
    apply(progress.get())
    return progress.on('change', apply)
  }, [progress, chapter, index, count])

  return (
    <Tag ref={ref} className={className} style={{ opacity: 0, willChange: 'opacity, transform' }}>
      {children}
    </Tag>
  )
}

function ChapterFrame({ chapter, children, align = 'left' }) {
  const alignCls =
    align === 'center' ? 'justify-center text-center' : align === 'right' ? 'justify-end' : 'justify-start'
  return (
    <div
      id={`chapter-${chapter.id}`}
      className="absolute inset-x-0"
      style={{ top: `${chapter.start * TRACK_VH}vh`, height: `${(chapter.end - chapter.start) * TRACK_VH}vh` }}
    >
      <div className={`sticky top-0 flex h-screen items-center px-6 sm:px-14 lg:px-24 ${alignCls}`}>{children}</div>
    </div>
  )
}

function Eyebrow({ children }) {
  return (
    <p className="flex items-center gap-3 font-display text-xs font-semibold tracking-[0.3em] text-brand-700 uppercase">
      <span className="inline-block h-px w-10 bg-brand-400" aria-hidden />
      {children}
    </p>
  )
}

const H1 = 'font-display font-extrabold tracking-[-0.03em] text-ink leading-[0.98]'
const H2 = 'font-display font-extrabold tracking-[-0.02em] text-ink leading-[1.02]'
const LEAD = 'text-lg leading-relaxed text-slate-600 sm:text-xl'

/* -------------------------------- chapters ------------------------------- */

function HeroChapter() {
  const ch = CHAPTERS[0]
  const reduce = Boolean(useReducedMotion())
  // The hero animates ON LOAD (staggered), not on scroll — the visitor lands
  // here and must see everything immediately.
  const item = (i) => ({
    initial: reduce ? { opacity: 1 } : { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay: 0.15 + i * 0.16, ease: [0.22, 1, 0.36, 1] },
  })
  return (
    <ChapterFrame chapter={ch} align="left">
      <div className="max-w-4xl">
        <motion.div {...item(0)} className="mb-6">
          <Eyebrow>G.C.E. Advanced Level · ICT</Eyebrow>
        </motion.div>
        <motion.h1 {...item(1)} className={`${H1} text-[clamp(2.6rem,7vw,6.2rem)]`}>
          A/L ICT.
          <span className="block bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">
            Taught right.
          </span>
        </motion.h1>
        <motion.p {...item(2)} className={`${LEAD} mt-6 max-w-xl`}>
          Structured theory, focused revision and six class hubs across the island —
          extended online through the BEICT learning system.
        </motion.p>
        <motion.div {...item(3)} className="mt-9 flex flex-wrap gap-4">
          <Button href={SITE.lmsUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-4 text-base">
            Start learning
          </Button>
          <Button href="#contact" variant="secondary" className="px-8 py-4 text-base">
            Contact Bhanuka Sir
          </Button>
        </motion.div>
      </div>
    </ChapterFrame>
  )
}

function IdentityChapter({ progress }) {
  const ch = CHAPTERS[1]
  return (
    <ChapterFrame chapter={ch} align="left">
      <div className="max-w-xl">
        <Beat progress={progress} chapter={ch} index={0} count={3} as="div" className="mb-5">
          <Eyebrow>Who is Bhanuka Sir</Eyebrow>
        </Beat>
        <Beat progress={progress} chapter={ch} index={1} count={3} as="h2" className={`${H2} text-[clamp(2rem,4.5vw,3.8rem)]`}>
          The teacher behind
          <span className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent"> the machine.</span>
        </Beat>
        <Beat progress={progress} chapter={ch} index={2} count={3} as="div" className={`mt-6 ${LEAD}`}>
          <div className="flex items-center gap-5">
            <img
              src="/images/bhanuka-sir.png"
              alt={`Portrait of ${SITE.owner}`}
              width="84"
              height="84"
              loading="lazy"
              className="size-20 rounded-2xl object-contain object-bottom ring-1 ring-slate-200"
            />
            <p>
              <span className="font-semibold text-white">{SITE.owner}</span> — {SITE.tagline}.
              Teaching {SITE.subject} for {SITE.level}, from Horana to the whole island.
            </p>
          </div>
        </Beat>
      </div>
    </ChapterFrame>
  )
}

function TrackChapter({ progress }) {
  const ch = CHAPTERS[2]
  const beats = [
    { v: '152,000+', l: 'people follow his teaching on Facebook' },
    { v: '80,000+', l: 'YouTube subscribers · 332 uploaded lessons' },
    { v: '6', l: 'class hubs, from Kurunegala to Kalutara' },
  ]
  return (
    <ChapterFrame chapter={ch} align="left">
      <div className="max-w-3xl">
        <Beat progress={progress} chapter={ch} index={0} count={4} as="div" className="mb-8">
          <Eyebrow>Track record</Eyebrow>
        </Beat>
        {beats.map((b, i) => (
          <Beat key={b.l} progress={progress} chapter={ch} index={i + 1} count={4} as="div" className="mb-7 border-l-2 border-brand-300 pl-6">
            <p className="font-display text-[clamp(2.4rem,5.5vw,4.6rem)] font-extrabold leading-none tracking-tight text-navy-800">
              {b.v}
            </p>
            <p className="mt-2 text-base text-slate-500">{b.l}</p>
          </Beat>
        ))}
      </div>
    </ChapterFrame>
  )
}

function CoreChapter({ progress }) {
  const ch = CHAPTERS[3]
  const btnRef = useRef(null)

  useEffect(() => {
    const el = btnRef.current
    if (!el) return
    const { start, end } = ch
    const apply = (p) => {
      const local = (p - start) / (end - start)
      // appears at 80% of the chapter, gone shortly after it ends
      const o = clamp01((local - 0.8) / 0.14) * (1 - clamp01((local - 1.02) / 0.06))
      el.style.opacity = o.toFixed(3)
      el.style.pointerEvents = o > 0.5 ? 'auto' : 'none'
      el.style.transform = `translateY(${(1 - o) * 26}px) scale(${0.92 + o * 0.08})`
    }
    apply(progress.get())
    return progress.on('change', apply)
  }, [progress, ch])

  return (
    <ChapterFrame chapter={ch} align="left">
      <div className="max-w-xl">
        <Beat progress={progress} chapter={ch} index={0} count={3} as="div" className="mb-5">
          <Eyebrow>Inside the teacher’s mind</Eyebrow>
        </Beat>
        <Beat progress={progress} chapter={ch} index={1} count={3} as="h2" className={`${H2} text-[clamp(2rem,4.5vw,3.8rem)]`}>
          Peel it back.
          <span className="block text-slate-500">Layer by layer.</span>
        </Beat>
        <Beat progress={progress} chapter={ch} index={2} count={3} as="div" className={`mt-6 ${LEAD} space-y-3`}>
          <p>
            <span className="text-brand-600">The shell</span> — full A/L ICT coverage, in
            halls across the island and on YouTube for everyone.
          </p>
          <p>
            <span className="text-brand-600">The circuits</span> — theory, revision,
            practice. The same loop, every batch, until it sticks.
          </p>
          <p>
            <span className="text-brand-600">The core</span> — a quarter-million-strong
            community, learning together every week.
          </p>
        </Beat>
      </div>
      <div
        ref={btnRef}
        className="fixed inset-x-0 bottom-[15%] z-20 flex justify-center opacity-0"
        style={{ pointerEvents: 'none' }}
      >
        <Button href="#contact" className="px-10 py-4 text-lg shadow-glow">
          Enroll Now <span aria-hidden>→</span>
        </Button>
      </div>
    </ChapterFrame>
  )
}

function VaultChapter({ progress }) {
  const ch = CHAPTERS[4]
  return (
    <ChapterFrame chapter={ch} align="left">
      <div className="max-w-xl">
        <Beat progress={progress} chapter={ch} index={0} count={2} as="div" className="mb-5">
          <Eyebrow>Syllabus Vault</Eyebrow>
        </Beat>
        <Beat progress={progress} chapter={ch} index={1} count={2} as="h2" className={`${H2} text-[clamp(2rem,4.5vw,3.8rem)]`}>
          Three cartridges.
          <span className="block bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">
            One syllabus.
          </span>
        </Beat>
      </div>
    </ChapterFrame>
  )
}

function MapChapter({ progress }) {
  const ch = CHAPTERS[5]
  return (
    <ChapterFrame chapter={ch} align="left">
      <div className="max-w-xl">
        <Beat progress={progress} chapter={ch} index={0} count={3} as="div" className="mb-5">
          <Eyebrow>Class centres</Eyebrow>
        </Beat>
        <Beat progress={progress} chapter={ch} index={1} count={3} as="h2" className={`${H2} text-[clamp(2rem,4.5vw,3.8rem)]`}>
          Six hubs.
          <span className="block bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">
            One island.
          </span>
        </Beat>
        <Beat progress={progress} chapter={ch} index={2} count={3} as="div" className="mt-6 flex flex-wrap gap-2">
          {VENUES.map((v) => (
            <a
              key={v.name}
              href={mapsUrlFor(v)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-brand-400 hover:text-brand-700"
            >
              {v.name} · {v.town}
            </a>
          ))}
        </Beat>
      </div>
    </ChapterFrame>
  )
}

function CommunityChapter({ progress }) {
  const ch = CHAPTERS[6]
  const stats = [
    { v: '152K+', l: 'Facebook followers', href: SITE.facebookUrl, plat: 'Facebook' },
    { v: '80K+', l: 'YouTube · 332 lessons', href: SITE.youtubeUrl, plat: 'YouTube' },
    { v: '713K+', l: 'TikTok likes', href: SITE.tiktokUrl, plat: 'TikTok' },
  ]
  return (
    <ChapterFrame chapter={ch} align="center">
      <div className="w-full max-w-4xl">
        <Beat progress={progress} chapter={ch} index={0} count={2} as="div" className="mb-10 flex justify-center">
          <Eyebrow>The BEICT community</Eyebrow>
        </Beat>
        <div className="grid gap-10 sm:grid-cols-3">
          {stats.map((s, i) => (
            <Beat key={s.plat} progress={progress} chapter={ch} index={i + 1} count={4} as="div">
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="group block">
                <p className="font-display text-[clamp(3rem,6vw,5rem)] font-extrabold leading-none tracking-tight text-navy-800">
                  {s.v}
                </p>
                <p className="mt-2 text-sm text-slate-500">{s.l}</p>
                <p className="mt-3 text-[11px] font-semibold tracking-[0.2em] text-cyan-300 uppercase">
                  {s.plat} ↗
                </p>
              </a>
            </Beat>
          ))}
        </div>
      </div>
    </ChapterFrame>
  )
}

function GalleryChapter({ progress }) {
  const ch = CHAPTERS[7]
  return (
    <ChapterFrame chapter={ch} align="center">
      <div className="max-w-lg">
        <Beat progress={progress} chapter={ch} index={0} count={1} as="div" className="flex flex-col items-center gap-4">
          <Eyebrow>Gallery</Eyebrow>
          <h2 className={`${H2} text-[clamp(1.8rem,4vw,3.2rem)]`}>Inside the classroom</h2>
          <p className={LEAD}>Moments from BEICT classes — fly through them.</p>
        </Beat>
      </div>
    </ChapterFrame>
  )
}

/* -------------------------------- the track ------------------------------- */

const CHAPTER_VIEWS = {
  hero: HeroChapter,
  identity: IdentityChapter,
  track: TrackChapter,
  core: CoreChapter,
  vault: VaultChapter,
  map: MapChapter,
  community: CommunityChapter,
  gallery: GalleryChapter,
}

export default function ZScrollTrack({ progress, progressRef, reduce }) {
  return (
    <div className="relative" style={{ height: `${TRACK_VH}vh` }}>
      <Suspense fallback={null}>
        <StageCanvas progressRef={progressRef} reduce={reduce} />
      </Suspense>
      {CHAPTERS.map((chapter) => {
        const View = CHAPTER_VIEWS[chapter.id]
        return <View key={chapter.id} progress={progress} />
      })}
    </div>
  )
}
