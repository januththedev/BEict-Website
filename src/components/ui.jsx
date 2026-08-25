import { motion, useReducedMotion } from 'framer-motion'

/**
 * Small shared UI primitives: Button, SectionHeading, Reveal.
 * Kept in one file because each is tiny; split out if they grow.
 */

export function Button({
  as: Comp = 'a',
  variant = 'primary',
  className = '',
  children,
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-display text-sm font-semibold tracking-wide transition-all duration-200 select-none'
  const variants = {
    primary:
      'bg-gradient-brand text-white shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-600/35 hover:-translate-y-0.5 active:translate-y-0',
    secondary:
      'border border-brand-200 bg-white text-brand-700 hover:border-brand-400 hover:bg-brand-50 hover:-translate-y-0.5 active:translate-y-0',
    ghostLight:
      'border border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:-translate-y-0.5 active:translate-y-0',
    ghostDark:
      'border border-white/20 text-white hover:border-cyan-300/60 hover:bg-white/5 hover:-translate-y-0.5 active:translate-y-0',
    white:
      'bg-white text-brand-700 shadow-lg shadow-navy-950/25 hover:-translate-y-0.5 active:translate-y-0',
  }
  return (
    <Comp className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </Comp>
  )
}

export function SectionHeading({ eyebrow, title, lead, dark = false, align = 'center' }) {
  const alignCls = align === 'center' ? 'text-center mx-auto' : 'text-left'
  return (
    <div className={`max-w-2xl ${alignCls}`}>
      {eyebrow && (
        <p
          className={`mb-3 inline-block rounded-full border px-4 py-1 font-display text-xs font-semibold tracking-[0.18em] uppercase ${
            dark
              ? 'border-white/15 bg-white/5 text-brand-200'
              : 'border-brand-200 bg-brand-50 text-brand-700'
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2 className={`font-display text-3xl font-bold sm:text-4xl ${dark ? 'text-white' : 'text-ink'}`}>
        {title}
      </h2>
      {lead && (
        <p
          className={`mt-4 text-base leading-relaxed ${
            dark ? 'text-brand-100/80' : 'text-slate-600'
          }`}
        >
          {lead}
        </p>
      )}
    </div>
  )
}

/** Fade-up reveal on scroll. Renders instantly when reduced motion is set. */
export function Reveal({ children, delay = 0, className = '' }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1, margin: '0px 0px 12% 0px' }}
      transition={{ duration: 0.45, delay: delay * 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
