import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import {
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'framer-motion'
import { JOURNEY, VENUES } from '../data/content.js'

const JourneyCanvas = lazy(() => import('../three/JourneyCanvas.jsx'))

const PANELS = [
  {
    id: 'intro',
    eyebrow: JOURNEY.intro.eyebrow,
    title: JOURNEY.intro.title,
    blurb: JOURNEY.intro.lead,
  },
  ...JOURNEY.stations.map((s) => ({
    id: s.id,
    eyebrow: s.topic,
    title: s.title,
    blurb: s.blurb,
    cta: s.cta,
    venues: s.venues,
  })),
]

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const smooth = (v) => {
  const t = clamp01(v)
  return t * t * (3 - 2 * t)
}

function Panel({ index, count, progress, reduce, panel }) {
  const ref = useRef(null)

  // Drive opacity/parallax by subscribing to the scroll progress directly.
  // (framer-motion v13 compiles useTransform style ranges into native WAAPI
  // scroll timelines whose offsets must stay within the element's own [0,1]
  // window — our ranges span the whole section, so we set styles manually.)
  useEffect(() => {
    if (reduce) return
    const el = ref.current
    if (!el) return
    const a = index / count
    const b = (index + 1) / count
    const fade = 0.06

    const apply = (p) => {
      let opacity
      if (index === 0) {
        opacity = 1 - smooth((p - (b - fade)) / (2 * fade))
      } else {
        opacity =
          smooth((p - (a - fade)) / (2 * fade)) *
          (1 - smooth((p - (b - fade)) / (2 * fade)))
      }
      const t = clamp01((p - a) / (b - a))
      const y = 48 - smooth(t) * 96
      el.style.opacity = clamp01(opacity).toFixed(3)
      el.style.transform = `translateY(${y.toFixed(1)}px)`
    }

    apply(progress.get())
    return progress.on('change', apply)
  }, [index, count, progress, reduce])

  const align =
    index === 0
      ? 'items-center justify-center text-center'
      : index % 2 === 1
        ? 'items-center justify-start'
        : 'items-center justify-end'

  const inner = (
    <div
      className={`pointer-events-auto max-w-md rounded-2xl border border-white/10 bg-navy-950/55 p-6 backdrop-blur-md sm:p-8 ${
        index === 0 ? 'border-white/15 bg-navy-950/40' : ''
      }`}
    >
      <p className="font-display text-xs font-semibold tracking-[0.2em] text-brand-200 uppercase">
        {panel.eyebrow}
      </p>
      {index === 0 ? (
        <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
          {panel.title}
        </h2>
      ) : (
        <h3 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
          {panel.title}
        </h3>
      )}
      <p className="mt-3 text-sm leading-relaxed text-brand-100/80 sm:text-base">
        {panel.blurb}
      </p>
      {panel.venues && (
        <ul className="mt-5 flex flex-wrap gap-1.5">
          {VENUES.map((v) => (
            <li
              key={v.name}
              className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-cyan-100"
            >
              {v.name} · {v.town}
            </li>
          ))}
        </ul>
      )}
      {panel.cta && (
        <a
          href={panel.cta.href}
          target={panel.cta.external ? '_blank' : undefined}
          rel={panel.cta.external ? 'noopener noreferrer' : undefined}
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 font-display text-xs font-bold text-brand-700 shadow-lg transition-transform duration-200 hover:-translate-y-0.5"
        >
          {panel.cta.label}
          <svg viewBox="0 0 16 16" fill="none" className="size-3.5" aria-hidden>
            <path d="M3 8h9m0 0-3.5-3.5M12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      )}
    </div>
  )

  return (
    <div className={`flex h-full px-5 sm:px-10 lg:px-20 ${align}`}>
      <div ref={ref} style={reduce ? undefined : { willChange: 'opacity, transform' }}>
        {inner}
      </div>
    </div>
  )
}

/**
 * Z-scroll experience: a sticky full-viewport canvas behind a tall scroll
 * track. Scrolling dollies the camera along -Z through the glTF stations
 * while story panels fade in and out in sync.
 */
export default function ScrollJourney() {
  const wrapRef = useRef(null)
  const progressRef = useRef(0)
  const reduce = Boolean(useReducedMotion())
  const [near, setNear] = useState(false)

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ['start start', 'end end'],
  })
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    progressRef.current = v
  })

  // The three.js chunk and models only render when the visitor approaches
  // this section — but we start downloading them during browser idle time
  // right after page load, so the stage is ready before anyone scrolls here.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true)
          observer.disconnect()
        }
      },
      { rootMargin: '1200px' },
    )
    observer.observe(el)
    const warm = () => {
      // Importing the chunk runs its module-level useGLTF.preload() calls,
      // fetching all three models while the browser is idle.
      import('../three/JourneyCanvas.jsx').catch(() => {})
    }
    let cancelled = false
    const timer = setTimeout(() => {
      if (!cancelled && 'requestIdleCallback' in window) {
        requestIdleCallback(warm, { timeout: 4000 })
      } else if (!cancelled) {
        warm()
      }
    }, 1500)
    return () => {
      cancelled = true
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  return (
    <section
      id="explore"
      ref={wrapRef}
      className="relative bg-[#071229]"
      style={{ height: `${PANELS.length * 100}svh` }}
      aria-label="Interactive 3D journey through ICT topics"
    >
      {/* Pinned 3D stage */}
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <Suspense
          fallback={
            <div className="grid size-full place-items-center bg-[#071229]">
              <div className="size-10 animate-spin rounded-full border-2 border-brand-400/30 border-t-brand-400" role="status" aria-label="Loading 3D scene" />
            </div>
          }
        >
          {near && (
            <JourneyCanvas progressRef={progressRef} reduce={reduce} />
          )}
        </Suspense>
      </div>

      {/* Story panels */}
      <div
        className="pointer-events-none absolute inset-0 z-10 grid"
        style={{ gridTemplateRows: `repeat(${PANELS.length}, 1fr)` }}
      >
        {PANELS.map((panel, i) => (
          <Panel
            key={panel.id}
            index={i}
            count={PANELS.length}
            progress={scrollYProgress}
            reduce={reduce}
            panel={panel}
          />
        ))}
      </div>
    </section>
  )
}
