import { useCms } from '../cms/CmsProvider'
import { T } from '../cms/edit'
import { ArrowUpRightIcon, FacebookIcon, YoutubeIcon } from './Icons'
import { Logo } from './Logo'

export function Footer() {
  const cms = useCms()
  const { c } = cms
  const s = c.site

  return (
    <footer className="bg-navy-950 text-brand-100/80" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:gap-16">
        <div className="flex flex-col items-start gap-4">
          <Logo variant="dark" />
          <T p="footer.blurb" as="p" multiline className="block max-w-xs text-sm leading-relaxed" />
          <div className="flex gap-3">
            <a
              href={s.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="BEICT on Facebook (opens in a new tab)"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-brand-600"
            >
              <FacebookIcon className="h-4.5 w-4.5" />
            </a>
            <a
              href={s.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Bhanuka Ekanayaka on YouTube (opens in a new tab)"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-brand-600"
            >
              <YoutubeIcon className="h-4.5 w-4.5" />
            </a>
            <a
              href={s.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="BEICT on WhatsApp (opens in a new tab)"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-brand-600"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4.5 w-4.5">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </a>
          </div>
        </div>

        <nav aria-label="Footer">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">Explore</h3>
          <ul className="mt-4 grid gap-2.5 text-sm">
            {c.nav.links.map((link) => (
              <li key={link.href + link.label}>
                <a href={link.href} className="transition-colors hover:text-white">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
            Learning &amp; Contact
          </h3>
          <ul className="mt-4 grid gap-2.5 text-sm">
            <li>
              <a
                href={s.lmsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-white transition-colors hover:text-brand-300"
              >
                {s.lmsLabel} — lms.beict.lk <ArrowUpRightIcon className="h-3.5 w-3.5" />
              </a>
            </li>
            <li>
              <a href={s.phoneHref} className="transition-colors hover:text-white">
                {s.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${s.email}`} className="transition-colors hover:text-white">
                {s.email}
              </a>
            </li>
            <li>{s.hours}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs sm:flex-row sm:px-6">
          <T p="footer.copyright" as="p" />
          <p>
            {c.footer.onlineLabel}{' '}
            <a
              href={s.lmsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-200 underline underline-offset-2 hover:text-white"
            >
              lms.beict.lk
            </a>
          </p>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-5 text-center text-xs sm:px-6">
          <p className="text-brand-100/60">
            {c.footer.creditPre}{' '}
            <a
              href={s.developerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-200 underline underline-offset-2 transition-colors hover:text-white"
            >
              {s.developerName}
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
