import { useEffect, useRef, useState } from 'react'
import { CORE_TOPICS, SITE } from '../data/content'
import type { CoreTopic } from '../data/content'
import { ArrowUpRightIcon } from './Icons'
import { Reveal, SectionHeading } from './ui'

const openTopic = (topic: CoreTopic) => {
  if (!topic.href) return
  window.open(topic.href, '_blank', 'noopener,noreferrer')
}

/**
 * Interactive 3D "BEICT Core". The canvas is decorative/interactive sugar —
 * every topic is also a plain button below it, so keyboard and screen-reader
 * users lose nothing. If WebGL or motion is unavailable the canvas simply
 * never mounts and the buttons carry the section.
 */
export function CoreSection() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [label, setLabel] = useState<{ topic: CoreTopic; x: number; y: number } | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = canvasRef.current
    if (!canvas) return

    let dispose: (() => void) | undefined
    let cancelled = false

    import('../three/CoreScene')
      .then((m) =>
        m.mountCoreScene(canvas, {
          topics: CORE_TOPICS,
          onHover: (topic, x, y) => setLabel(topic ? { topic, x, y } : null),
          onSelect: openTopic,
        }),
      )
      .then((d) => {
        if (cancelled) {
          d()
          return
        }
        dispose = d
        setReady(true)
      })
      .catch(() => {
        /* WebGL unavailable — topic buttons below still work */
      })

    return () => {
      cancelled = true
      dispose?.()
      setLabel(null)
    }
  }, [])

  return (
    <section className="bg-white py-20 sm:py-24" aria-labelledby="core-title">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="core-title"
          eyebrow="Interactive"
          title="Explore the BEICT core"
          lede="Everything BEICT teaches, orbiting one centre. Drag the core to spin it — select a node to open the matching lesson."
        />

        <Reveal delay={120}>
          <div className="relative mt-12 h-[400px] overflow-hidden rounded-3xl bg-navy-900 shadow-lift sm:h-[480px]">
            {/* faint grid backdrop for non-WebGL fallback */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]"
              aria-hidden="true"
              viewBox="0 0 900 480"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <pattern id="core-grid" width="44" height="44" patternUnits="userSpaceOnUse">
                  <path d="M44 0H0v44" fill="none" stroke="#608ffa" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="900" height="480" fill="url(#core-grid)" />
            </svg>

            <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />

            {/* floating label for the hovered node */}
            {label && (
              <div
                className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[130%] rounded-xl border border-white/15 bg-navy-950/90 px-4 py-2.5 text-center shadow-lift backdrop-blur"
                style={{ left: label.x, top: label.y }}
              >
                <p className="font-display text-sm font-bold text-white">{label.topic.label}</p>
                <p className="mt-0.5 text-xs text-brand-200">{label.topic.hint}</p>
                <p className="mt-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-sky-300">
                  Click to open <ArrowUpRightIcon className="h-3 w-3" />
                </p>
              </div>
            )}

            {/* hints */}
            <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-100 backdrop-blur">
              {ready ? 'Drag to spin · Click a node' : 'Interactive'}
            </div>
            <div className="pointer-events-none absolute bottom-4 right-4 font-mono text-[11px] text-brand-200/80">
              beict.lk · webgl
            </div>
          </div>
        </Reveal>

        {/* Accessible equivalents of the 3D nodes */}
        <Reveal delay={200}>
          <ul className="mt-6 flex flex-wrap justify-center gap-2.5" aria-label="Core topics">
            {CORE_TOPICS.map((topic) => (
              <li key={topic.id}>
                <button
                  type="button"
                  onClick={() => openTopic(topic)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition-all hover:-translate-y-0.5 hover:border-brand-400 hover:bg-brand-50 active:translate-y-0"
                >
                  {topic.label}
                  <ArrowUpRightIcon className="h-3.5 w-3.5" />
                  <span className="sr-only">— {topic.hint} (opens in a new tab)</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-center text-xs text-slate-body">
            The 3D view is optional decoration — every topic above is a real link into the{' '}
            <a href={SITE.lmsUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-700 underline underline-offset-2">
              learning system
            </a>{' '}
            and the YouTube channel.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
