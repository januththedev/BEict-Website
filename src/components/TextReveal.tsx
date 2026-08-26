import { Children, cloneElement, isValidElement, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

/**
 * Text motion system — five distinct reveal variants, plus <BlurIn> for
 * whole-block fades. Everything is armed via useLayoutEffect (no flash of
 * hidden text if JS is slow) and never armed at all under
 * `prefers-reduced-motion` (content simply appears).
 *
 * Variants (see index.css `.tr-v-*`):
 *  - mask    word slides up out of an overflow mask (the signature effect)
 *  - letters character-by-character stagger
 *  - flip    words flip up on the X axis
 *  - slide-x words slide in horizontally (from = 'left' | 'right')
 *  - scale   words settle down from oversized + blurred
 */

export type TextVariant = 'mask' | 'letters' | 'flip' | 'slide-x' | 'scale'

interface SplitState {
  i: number
}

function splitWords(
  children: ReactNode,
  state: SplitState,
  base: number,
  step: number,
  variant: TextVariant,
): ReactNode {
  const wrap = (text: string, key: string) => {
    if (variant === 'letters') {
      return [...text].map((ch, k) => {
        const delay = base + state.i++ * step
        return (
          <span className="tr-char" style={{ transitionDelay: `${delay}ms` }} key={`${key}-${k}`}>
            {ch}
          </span>
        )
      })
    }
    const delay = base + state.i++ * step
    return (
      <span className="tr-word" key={key}>
        <span style={{ transitionDelay: `${delay}ms` }}>{text}</span>
      </span>
    )
  }

  const mapPiece = (piece: string, keyBase: string) => {
    if (piece === '') return null
    if (/^\s+$/.test(piece)) return piece
    if (variant === 'letters') {
      // keep words unbreakable while animating per character
      return (
        <span className="tr-nowrap" key={keyBase}>
          {wrap(piece, keyBase)}
        </span>
      )
    }
    return wrap(piece, keyBase)
  }

  const walk = (node: ReactNode, keyBase = 'n'): ReactNode => {
    return Children.map(node, (child, k) => {
      const key = `${keyBase}-${k}`
      if (typeof child === 'string') {
        return child.split(/(\s+)/).map((piece, j) => mapPiece(piece, `${key}-${j}`))
      }
      if (isValidElement(child)) {
        const props = child.props as { children?: ReactNode }
        return cloneElement(child, undefined, walk(props.children, key))
      }
      return child
    })
  }

  return children ? walk(children) : null
}

interface TextRevealProps {
  children: ReactNode
  /** Which reveal style to use — vary them across the page. */
  variant?: TextVariant
  /** For `slide-x`: which edge the words come in from. */
  from?: 'left' | 'right'
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  className?: string
  id?: string
  /** Delay before the first word/character, ms. */
  delay?: number
  /** Extra delay per word (or character for `letters`), ms. */
  step?: number
}

export function TextReveal({
  children,
  variant = 'mask',
  from = 'left',
  as = 'span',
  className = '',
  id,
  delay = 0,
  step = 45,
}: TextRevealProps) {
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
    // failsafe: reveal even if the observer never fires
    const timer = setTimeout(() => setInView(true), 3000)
    return () => {
      observer.disconnect()
      clearTimeout(timer)
    }
  }, [armed])

  const state = { i: 0 }

  return (
    <Tag
      ref={ref as never}
      id={id}
      className={[
        className,
        'tr-armed',
        `tr-v-${variant}`,
        variant === 'slide-x' && from === 'right' ? 'from-right' : '',
        inView ? 'in-view' : '',
      ]
        .filter(Boolean)
        .join(' ')
        .trim()}
    >
      {splitWords(children, state, delay, step, variant)}
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
    const timer = setTimeout(() => setInView(true), 3000)
    return () => {
      observer.disconnect()
      clearTimeout(timer)
    }
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
