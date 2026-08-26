import { Children, cloneElement, isValidElement, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

/**
 * Text motion system — two primitives, both armed via useLayoutEffect (so
 * there is never a flash of hidden text if JS is slow) and never armed at all
 * under `prefers-reduced-motion` (content simply appears):
 *
 *  - <TextReveal>  splits text into words, each masked in an overflow-hidden
 *                  span that slides up with a per-word stagger.
 *  - <BlurIn>      fades + de-blurs a block, with an optional delay.
 */

interface SplitState {
  i: number
}

function splitWords(children: ReactNode, state: SplitState, base: number, step: number): ReactNode {
  return children
    ? Children.map(children, (child) => {
        if (typeof child === 'string') {
          return child.split(/(\s+)/).map((piece, k) => {
            if (piece === '') return null
            if (/^\s+$/.test(piece)) return piece
            const delay = base + state.i++ * step
            return (
              <span className="tr-word" key={`${delay}-${k}`}>
                <span style={{ transitionDelay: `${delay}ms` }}>{piece}</span>
              </span>
            )
          })
        }
        if (isValidElement(child)) {
          const props = child.props as { children?: ReactNode }
          return cloneElement(child, undefined, splitWords(props.children, state, base, step))
        }
        return child
      })
    : null
}

interface TextRevealProps {
  children: ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  className?: string
  id?: string
  /** Delay before the first word, ms. */
  delay?: number
  /** Extra delay per word, ms. */
  step?: number
}

export function TextReveal({ children, as = 'span', className = '', id, delay = 0, step = 45 }: TextRevealProps) {
  const Tag = as
  const ref = useRef<HTMLElement | null>(null)
  const [armed, setArmed] = useState(false)
  const [inView, setInView] = useState(false)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setArmed(true)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!armed || !el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [armed])

  const state = { i: 0 }

  return (
    <Tag
      ref={ref as never}
      id={id}
      className={`${className} ${armed ? 'tr-armed' : ''} ${inView ? 'in-view' : ''}`.trim()}
    >
      {splitWords(children, state, delay, step)}
    </Tag>
  )
}

interface BlurInProps {
  children: ReactNode
  as?: 'div' | 'p' | 'span' | 'section'
  className?: string
  /** Delay before this block starts, ms. */
  delay?: number
}

export function BlurIn({ children, as = 'div', className = '', delay = 0 }: BlurInProps) {
  const Tag = as
  const ref = useRef<HTMLElement | null>(null)
  const [armed, setArmed] = useState(false)
  const [inView, setInView] = useState(false)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setArmed(true)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!armed || !el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [armed])

  return (
    <Tag
      ref={ref as never}
      className={`${className} ${armed ? 'tr-armed' : ''} ${inView ? 'in-view' : ''}`.trim()}
      style={delay ? ({ '--tr-delay': `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </Tag>
  )
}
