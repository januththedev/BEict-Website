import { useEffect, useRef } from 'react'

/**
 * Pointer-tracked 3D tilt for cards. Disabled automatically on touch-only
 * devices and for reduced-motion users (it simply does nothing there).
 * Inline transform overrides the hover-lift class while active; clearing it
 * on pointer-leave hands control back to CSS.
 */
export function useTilt<T extends HTMLElement>(max = 5) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(hover: none)').matches) return

    el.style.willChange = 'transform'

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      el.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-3px)`
    }
    const leave = () => {
      el.style.transform = ''
    }

    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      el.style.willChange = ''
      el.style.transform = ''
    }
  }, [max])

  return ref
}
