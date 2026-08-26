import { useEffect, useRef } from 'react'

/**
 * Adds `.is-visible` to the element when it first enters the viewport,
 * driving the CSS `.reveal` fade-up. Elements already in view on load
 * (or with reduced motion / no IntersectionObserver) become visible
 * immediately so content is never hidden behind JS.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      el.classList.add('is-visible')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
    )

    observer.observe(el)
    // safety net: never leave content invisible if the observer misfires
    const failsafe = setTimeout(() => el.classList.add('is-visible'), 2500)
    return () => {
      observer.disconnect()
      clearTimeout(failsafe)
    }
  }, [])

  return ref
}
