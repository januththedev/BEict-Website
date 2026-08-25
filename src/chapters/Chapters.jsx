import { lazy, Suspense, useEffect, useRef } from 'react'
import { CHAPTERS, SITE, TRACK_VH, VENUES, mapsUrlFor } from '../data/content.js'
import { Button } from '../components/ui.jsx'

/**
 * The full-site Z-scroll track: the persistent 3D stage behind absolutely
 * positioned chapter overlays. Each chapter owns a [start, end] slice of the
 * track's scroll progress; panels fade/translate via direct style writes
 * (avoids framer-motion v13's WAAPI scroll-timeline offset limits).
 */

const StageCanvas = lazy(() => import('../three/StageCanvas.jsx'))

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const smooth = (v) => {
  const t = clamp01(v)
  return t * t * (3 - 2 * t)
}

function Panel({ chapter, progress, isHero = false, align = 'left', tone = 'dark', width = 'max-w-xl', children }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const { start, end } = chapter
    const span = end - start
    const fade = span * 0.24
    const apply = (p) => {
      let o
      if (isHero) {
        o = 1 - smooth((p - (end - fade)) / (2 * fade))
      } else {
        o =
          smooth((p - (start + fade * 0.35)) / (2 * fade)) *
          (1 - smooth((p - (end - fade)) / (2 * fade)))
      }
      const local = clamp01((p - start) / span)
      const y = (0.5 - local) * 70
      el.style.opacity = clamp01(o).toFixed(3)
      el.style.transform = `translateY(${y.toFixed(1)}px)`
    }
    apply(progress.get())
    return progress.on('change', apply)
  }, [chapter, progress, isHero])

  const alignCls =
    align === 'center'
      ? 'justify-center text-center'
      : align === 'right'
        ? 'justify-end'
        : 'justify-start'

  return (
    <div
      id={`chapter-${chapter.id}`}
      className="absolute inset-x-0"
      style={{ top: `${chapter.start * TRACK_VH}vh`, height: `${(chapter.end - chapter.start) * TRACK_VH}vh` }}
    >
      <div className={`sticky top-0 flex h-screen items-center px-5 sm:px-10 lg:px-20 ${alignCls}`}>
        <div
          ref={ref}
          style={{ willChange: 'opacity, transform' }}
          className={`pointer-events-auto ${width} ${tone === 'dark' ? 'text-brand-50' : 'text-ink'}`}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

function Eyebrow({ children, tone }) {
  return (
    <p
      className={`mb-3 inline-block rounded-full border px-4 py-1 font-display text-xs font-semibold tracking-[0.18em] uppercase ${
        tone === 'light'
          ? 'border-brand-200 bg-brand-50 text-brand-700'
          : 'border-white/15 bg-white/5 text-brand-200'
      }`}
    >
      {children}
    </p>
  )
}

function GlassCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-navy-950/55 p-6 backdrop-blur-md sm:p-8 ${className}`}>
      {children}
    </div>
  )
}

/* ------------------------------- chapters ------------------------------- */

function HeroChapter({ progress }) {
  const ch = CHAPTERS[0]
  return (
    <Panel chapter={ch} progress={progress} isHero tone="light" width="max-w-2xl">
      <Eyebrow tone="light">G.C.E. Advanced Level · ICT Classes</Eyebrow>
      <h1 className="mt-4 font-display text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-5xl xl:text-6xl">
        Information &amp; <span className="text-gradient-brand">Communication</span> Technology
      </h1>
      <p className="mt-4 font-display text-lg font-semibold text-brand-800">
        Conducted by {SITE.owner}
        <span className="block text-sm font-medium text-slate-500">“{SITE.tagline}”</span>
      </p>
      <p className="mt-3 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">
        Structured theory, focused revision and six class hubs across the island —
        extended online through the BEICT learning system.
      </p>
      <div className="mt-7 flex flex-wrap items-center gap-3.5">
        <Button href={SITE.lmsUrl} target="_blank" rel="noopener noreferrer" className="px-7 py-3.5 text-base">
          Get Started Learning Now
        </Button>
        <Button href="#contact" variant="secondary" className="px-7 py-3.5 text-base">
          Contact Bhanuka Sir
        </Button>
      </div>
      <p className="mt-3 font-sinhala text-sm text-slate-500">{SITE.sinhalaLmsInvite}</p>
    </Panel>
  )
}

function IdentityChapter({ progress }) {
  const ch = CHAPTERS[1]
  return (
    <Panel chapter={ch} progress={progress} align="left" width="max-w-lg">
      <GlassCard>
        <Eyebrow>About</Eyebrow>
        <div className="mt-4 flex items-center gap-4">
          <img
            src="/images/bhanuka-sir.png"
            alt={`Portrait of ${SITE.owner}`}
            width="96"
            height="96"
            loading="lazy"
            className="size-20 rounded-2xl object-contain object-bottom ring-1 ring-white/15"
          />
          <div>
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Meet Bhanuka Sir</h2>
            <p className="text-sm text-brand-200">{SITE.tagline}</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-brand-100/85 sm:text-base">
          {SITE.owner} teaches {SITE.subject} for {SITE.level} students — from Horana
          to the island, in halls and online. The workstation behind this panel is
          where every lesson is built.
        </p>
        <ul className="mt-5 space-y-2.5 text-sm text-brand-100/85">
          {['Structured theory for the full A/L ICT syllabus', 'Dedicated revision batches (2026 & 2027 A/L)', 'BEICT අන්තර්ජාල ඉගෙනුම් පද්ධතිය — online, always'].map((point) => (
            <li key={point} className="flex items-start gap-2.5">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-cyan-300" aria-hidden />
              {point}
            </li>
          ))}
        </ul>
      </GlassCard>
    </Panel>
  )
}

function TrackChapter({ progress }) {
  const ch = CHAPTERS[2]
  const stats = [
    { v: '152K+', l: 'Facebook followers' },
    { v: '80K+', l: 'YouTube subscribers · 332 lessons' },
    { v: '6', l: 'island-wide class hubs' },
    { v: '2026 & 2027', l: 'A/L batches in class now' },
  ]
  return (
    <Panel chapter={ch} progress={progress} align="right" width="max-w-lg">
      <GlassCard>
        <Eyebrow>Track record</Eyebrow>
        <h2 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
          The numbers behind the name
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.l} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="font-display text-xl font-extrabold text-white sm:text-2xl">{s.v}</p>
              <p className="mt-0.5 text-xs text-brand-100/70">{s.l}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-brand-100/60">
          Every badge and module flying beside this card is a real syllabus unit —
          taught in class, revised online, proven across hundreds of uploaded lessons.
        </p>
      </GlassCard>
    </Panel>
  )
}

function CoreChapter({ progress }) {
  const ch = CHAPTERS[3]
  const btnRef = useRef(null)

  // The Enroll trigger appears as the core condenses (last 20% of the chapter).
  useEffect(() => {
    const el = btnRef.current
    if (!el) return
    const { start, end } = ch
    const apply = (p) => {
      const local = (p - start) / (end - start)
      const o = clamp01((local - 0.78) / 0.16)
      el.style.opacity = o.toFixed(3)
      el.style.pointerEvents = o > 0.5 ? 'auto' : 'none'
      el.style.transform = `translateY(${(1 - o) * 24}px) scale(${0.9 + o * 0.1})`
    }
    apply(progress.get())
    return progress.on('change', apply)
  }, [progress, ch])

  return (
    <Panel chapter={ch} progress={progress} align="left" width="max-w-md">
      <GlassCard>
        <Eyebrow>The Teacher’s Mind</Eyebrow>
        <h2 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
          Philosophy, peeled open
        </h2>
        <ul className="mt-5 space-y-4 text-sm leading-relaxed text-brand-100/85">
          <li>
            <span className="font-display font-bold text-cyan-300">The shell —</span> a
            Horana-based ICT teacher covering the full G.C.E. A/L syllabus, in halls
            across the island and on YouTube for everyone else.
          </li>
          <li>
            <span className="font-display font-bold text-cyan-300">The circuits —</span>{' '}
            Theory explained simply → revised under exam pressure → practised until
            the logic sticks.
          </li>
          <li>
            <span className="font-display font-bold text-cyan-300">The core —</span> a
            quarter-million-strong community learning together, every single week.
          </li>
        </ul>
      </GlassCard>
      {/* Enroll trigger — appears as the 3D core condenses */}
      <div ref={btnRef} className="fixed inset-x-0 bottom-[14%] z-20 flex justify-center opacity-0" style={{ pointerEvents: 'none' }}>
        <Button href="#contact" className="px-9 py-4 text-base shadow-glow">
          Enroll Now
          <span aria-hidden>→</span>
        </Button>
      </div>
    </Panel>
  )
}

function VaultChapter({ progress }) {
  const ch = CHAPTERS[4]
  return (
    <Panel chapter={ch} progress={progress} align="left" width="max-w-md">
      <GlassCard>
        <Eyebrow>Syllabus Vault</Eyebrow>
        <h2 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
          Three cartridges. One syllabus.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-brand-100/85 sm:text-base">
          Everything the A/L ICT exam asks — hardware, networks and software —
          ejected cartridge by cartridge as you scroll.
        </p>
        <ul className="mt-4 space-y-1.5 text-xs text-brand-100/65">
          <li>▸ Hardware &amp; Architecture — CPU, memory, logic</li>
          <li>▸ Networking &amp; Security — the OSI stack</li>
          <li>▸ Software &amp; Algorithms — code and binary</li>
        </ul>
      </GlassCard>
    </Panel>
  )
}

function MapChapter({ progress }) {
  const ch = CHAPTERS[5]
  return (
    <Panel chapter={ch} progress={progress} align="left" width="max-w-md">
      <GlassCard>
        <Eyebrow>Class Centres</Eyebrow>
        <h2 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
          Six hubs. One island.
        </h2>
        <p className="mt-2 text-sm text-brand-100/75">
          Tap a pin on the map — or a hall below — to open its exact location on
          Google Maps.
        </p>
        <ul className="mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {VENUES.map((v) => (
            <li key={v.name}>
              <a
                href={mapsUrlFor(v)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-brand-50 transition-colors hover:border-cyan-300/50 hover:bg-white/10"
              >
                <span className="text-orange-400" aria-hidden>
                  ⚲
                </span>
                {v.name}
                <span className="font-normal text-brand-100/60">· {v.town}</span>
              </a>
            </li>
          ))}
        </ul>
      </GlassCard>
    </Panel>
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
    <Panel chapter={ch} progress={progress} align="center" width="max-w-3xl">
      <Eyebrow tone="dark">The BEICT community</Eyebrow>
      <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
        A quarter of a million learners follow along
      </h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <a
            key={s.plat}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-white/10 bg-navy-950/55 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/40"
          >
            <p className="font-display text-3xl font-extrabold text-white">{s.v}</p>
            <p className="mt-1 text-xs text-brand-100/70">{s.l}</p>
            <p className="mt-2 text-[11px] font-semibold tracking-wide text-cyan-300 uppercase">
              {s.plat} ↗
            </p>
          </a>
        ))}
      </div>
    </Panel>
  )
}

function GalleryChapter({ progress }) {
  const ch = CHAPTERS[7]
  return (
    <Panel chapter={ch} progress={progress} align="center" width="max-w-lg">
      <div>
        <Eyebrow tone="dark">Gallery</Eyebrow>
        <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
          Inside the classroom
        </h2>
        <p className="mt-2 text-sm text-brand-100/75">
          Moments from BEICT classes — theory, revision and everything in between.
        </p>
      </div>
    </Panel>
  )
}

/* ------------------------------ the track ------------------------------ */

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

export default function ZScrollTrack({ progress, progressRef, reduce, onStageNear }) {
  const stageRef = useRef(null)

  // Mount the heavy 3D stage once the visitor is anywhere near the page top
  // (which is immediately — the track starts at the hero) — but keep the
  // lazy boundary OUTSIDE the canvas tree.
  useEffect(() => {
    onStageNear?.()
  }, [onStageNear])

  return (
    <div ref={stageRef} className="relative" style={{ height: `${TRACK_VH}vh` }}>
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
