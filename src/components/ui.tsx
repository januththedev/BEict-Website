import type { ReactNode } from 'react'
import { useReveal } from '../hooks/useReveal'
import { useCms } from '../cms/CmsProvider'
import { BlurIn, TextReveal, type TextVariant } from './TextReveal'
import { T } from '../cms/edit'
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
  titleKey: string
  ledeKey?: string
  align?: 'left' | 'center'
  dark?: boolean
  variant?: TextVariant
  from?: 'left' | 'right'
}

export function SectionHeading({
  id,
  eyebrow,
  titleKey,
  ledeKey,
  align = 'center',
  dark = false,
  variant = 'mask',
  from = 'left',
}: SectionHeadingProps) {
  const cms = useCms()
  const alignment = align === 'center' ? 'items-center text-center' : 'items-start text-left'

  // Admin edit mode: plain editable text instead of animated wrappers.
  if (cms.edit) {
    return (
      <div className={`flex flex-col gap-3 ${alignment}`}>
        <span
          className={`inline-flex items-center self-start rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
            align === 'center' ? 'self-center' : ''
          } ${dark ? 'bg-white/10 text-brand-200' : 'bg-brand-50 text-brand-700'}`}
        >
          {eyebrow}
        </span>
        <T p={titleKey} as="h2" id={id} className={`max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl ${dark ? 'text-white' : 'text-ink'}`} />
        {ledeKey && (
          <T
            p={ledeKey}
            as="p"
            multiline
            className={`max-w-xl text-base leading-relaxed ${dark ? 'text-brand-100/80' : 'text-slate-body'}`}
          />
        )}
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-3 ${alignment}`}>
      <BlurIn
        as="span"
        className={`inline-flex items-center gap-2 self-start rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
          align === 'center' ? 'self-center' : ''
        } ${dark ? 'bg-white/10 text-brand-200' : 'bg-brand-50 text-brand-700'}`}
      >
        {eyebrow}
      </BlurIn>
      <TextReveal
        as="h2"
        id={id}
        variant={variant}
        from={from}
        delay={80}
        className={`max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl ${
          dark ? 'text-white' : 'text-ink'
        }`}
      >
        {cms.get(titleKey)}
      </TextReveal>
      {ledeKey && (
        <BlurIn
          as="p"
          delay={340}
          className={`max-w-xl text-base leading-relaxed ${dark ? 'text-brand-100/80' : 'text-slate-body'}`}
        >
          {cms.get(ledeKey)}
        </BlurIn>
      )}
    </div>
  )
}
