import { NAV_LINKS, SITE } from '../data/content.js'

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className="grid size-10 place-items-center rounded-xl bg-gradient-brand font-display text-sm font-extrabold text-white"
                aria-hidden
              >
                BE
              </span>
              <span className="font-display text-xl font-bold tracking-tight text-white">BEICT</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              {SITE.subject} for {SITE.level} — taught by {SITE.owner}, in class and online.
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer navigation">
            <h2 className="font-display text-sm font-semibold tracking-wider text-white uppercase">
              Explore
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-slate-400 transition-colors hover:text-brand-300">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact + LMS */}
          <div>
            <h2 className="font-display text-sm font-semibold tracking-wider text-white uppercase">
              Contact &amp; Learning
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href={SITE.phoneTel} className="text-slate-400 transition-colors hover:text-brand-300">
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE.email}`} className="text-slate-400 transition-colors hover:text-brand-300">
                  {SITE.email}
                </a>
              </li>
              <li>
                <a
                  href={SITE.lmsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand-300 transition-colors hover:text-brand-200"
                >
                  lms.beict.lk →
                </a>
              </li>
            </ul>
            <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs">
              {[
                ['Facebook', SITE.facebookUrl],
                ['YouTube', SITE.youtubeUrl],
                ['TikTok', SITE.tiktokUrl],
                ['Telegram', SITE.telegramUrl],
              ].map(([label, href]) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-slate-400 transition-colors hover:text-brand-300"
                  >
                    {label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} {SITE.owner} · BEICT. All rights reserved.
          </p>
          <p className="text-xs text-slate-500">
            Developed by{' '}
            <a
              href="https://www.januth.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-slate-400 underline decoration-slate-600 underline-offset-2 transition-colors hover:text-brand-300 hover:decoration-brand-400"
            >
              Januth Nimnal
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
