interface LogoProps {
  /** `dark` renders the wordmark for dark backgrounds. */
  variant?: 'light' | 'dark'
}

/** Inline BEICT mark: gradient monogram tile + wordmark.
 * Drawn as SVG so no image request is needed and it stays crisp everywhere. */
export function Logo({ variant = 'light' }: LogoProps) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0" role="img" aria-label="BEICT logo">
        <defs>
          <linearGradient id="beict-mark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e4fd8" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="10" fill="url(#beict-mark)" />
        <text
          x="20"
          y="26.5"
          textAnchor="middle"
          fontFamily="'Sora Variable','Sora',sans-serif"
          fontWeight="800"
          fontSize="15"
          letterSpacing="-0.5"
          fill="#ffffff"
        >
          BE
        </text>
      </svg>
      <span className="leading-tight">
        <span
          className={`block font-display text-lg font-bold tracking-tight ${
            variant === 'dark' ? 'text-white' : 'text-ink'
          }`}
        >
          BEICT
        </span>
        <span
          className={`block text-[11px] font-medium tracking-wide ${
            variant === 'dark' ? 'text-brand-200' : 'text-slate-body'
          }`}
        >
          Bhanuka Ekanayaka ICT
        </span>
      </span>
    </span>
  )
}
