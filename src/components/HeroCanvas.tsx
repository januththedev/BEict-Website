import { useEffect, useRef, useState } from 'react'

/**
 * Mounts the WebGL hero field when motion is allowed. Until it reports
 * success (or forever, on failure / reduced motion) the static SVG backdrop
 * is shown instead — the hero never depends on WebGL.
 */
export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = canvasRef.current
    if (!canvas) return

    let dispose: (() => void) | undefined
    let cancelled = false

    import('../three/HeroField')
      .then((m) => m.mountHeroField(canvas))
      .then((d) => {
        if (cancelled) {
          d()
          return
        }
        dispose = d
        setActive(true)
      })
      .catch(() => {
        /* WebGL unavailable — SVG fallback remains */
      })

    return () => {
      cancelled = true
      dispose?.()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-700 ${
        active ? 'opacity-100' : 'opacity-0'
      }`}
    />
  )
}
