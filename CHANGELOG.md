# Changelog

All notable changes to this project are documented here.

## 1.0.0 — 2026-08-26

Initial fresh build of the BEICT public website.

### Added
- Vite + React 19 + TypeScript + Tailwind CSS v4 project, strict TypeScript.
- Single-page site: Hero, About, Batches, LMS band, Stay-connected banners, Contact, Footer.
- Typed content source (`src/data/content.ts`) with a verified-facts-only policy.
- External LMS integration: `lms.beict.lk` (Moodle) linked in new tab from navbar, hero,
  batch cards, LMS section, promo banner and footer — no LMS functionality embedded.
- Branded generated assets: `og-image.png` (1200×630) and three promo banners
  (`public/images/banners/*.webp`), produced by `scripts/generate-images.mjs` (sharp).
- SEO: meta description, canonical, Open Graph + Twitter large-card, JSON-LD
  (EducationalOrganization + Person), `robots.txt`, `sitemap.xml`.
- Self-hosted variable fonts (Sora, Inter, Noto Sans Sinhala) via Fontsource — no
  render-blocking third-party CDN.
- Accessibility: skip link, semantic landmarks, labelled form with `aria-invalid` +
  `role="alert"` validation, visible focus states, `prefers-reduced-motion` support.
- Validated contact form that opens the visitor's email app addressed to hello@beict.lk.
- Documentation: README (setup, structure, content policy), CONTENT-AUDIT.md (fact → source).

### Added (same day)
- Footer credit: "Developed by Januth Nimnal" linking to https://januth.dev.

### QA (2026-08-26)
- `tsc -b && vite build` clean; JS bundle ≈ 68 KB gzipped.
- Browser (Chromium via Playwright) against the production build:
  - 0 console errors / 0 warnings.
  - No horizontal overflow at 320 px and 390 px; desktop verified at 1440 px
    (screenshots in `qa/`).
  - Mobile menu open/close (incl. Escape) verified; LMS CTA present.
  - Contact form: empty-submit shows per-field errors; valid submit fires mailto and
    updates the status line.
