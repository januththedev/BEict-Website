import type { ReactNode } from 'react'
import { useReveal } from '../hooks/useReveal'
import { BlurIn, TextReveal } from './TextReveal'
/** Consistent button styling shared by every CTA on the site. */
export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:translate-y-0'

export const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-full border border-brand-200 bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-400 hover:bg-brand-50 active:translate-y-0'

interface RevealProps {
  children: ReactNode
  className?: string
  /** Stagger delay in ms for grids of cards. */
  delay?: number
}

/** Fade-up-on-scroll wrapper. Content is fully visible without JS or motion. */
export function Reveal({ children, className = '', delay = 0 }: RevealProps) {
  const ref = useReveal<HTMLDivElement>()
  return (
    <div ref={ref} className={`reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  )
}

interface SectionHeadingProps {
  id: string
  eyebrow: string
  /** Editorial section number, e.g. "01" — rendered inside the eyebrow chip. */
  index?: string
  title: ReactNode
  lede?: string
  align?: 'left' | 'center'
  dark?: boolean
}

export function SectionHeading({ id, eyebrow, index, title, lede, align = 'center', dark = false }: SectionHeadingProps) {
  const alignment = align === 'center' ? 'items-center text-center' : 'items-start text-left'
  return (
    <div className={`flex flex-col gap-3 ${alignment}`}>
      <BlurIn
        as="span"
        className={`inline-flex items-center gap-2 self-start rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
          align === 'center' ? 'self-center' : ''
        } ${dark ? 'bg-white/10 text-brand-200' : 'bg-brand-50 text-brand-700'}`}
      >
        {index && <span className={dark ? 'text-sky-300' : 'text-brand-400'}>{index}</span>}
        {eyebrow}
      </BlurIn>
      <TextReveal
        as="h2"
        id={id}
        delay={80}
        className={`max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl ${
          dark ? 'text-white' : 'text-ink'
        }`}
      >
        {title}
      </TextReveal>
      {lede && (
        <BlurIn
          as="p"
          delay={340}
          className={`max-w-xl text-base leading-relaxed ${dark ? 'text-brand-100/80' : 'text-slate-body'}`}
        >
          {lede}
        </BlurIn>
      )}
    </div>
  )
}
