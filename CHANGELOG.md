# Changelog

All notable changes to this project are documented here.

## 1.1.0-beta — 2026-08-26 (LOCAL ONLY — not pushed)

Interactive/WebGL upgrade. **Beta per owner instruction: committed locally, not pushed to
GitHub. Revert point is `2c59529`** (`git reset --hard 2c59529` restores the pre-beta site).

### Added
- **Interactive WebGL hero backdrop** (`src/three/HeroField.ts`): pointer-parallaxed
  particle network in BEICT blues; falls back to the static SVG grid when WebGL is
  unavailable or reduced motion is set.
- **"BEICT Core" 3D showcase** (`src/three/CoreScene.ts` + `CoreSection.tsx`): draggable
  wireframe core with orbiting topic nodes (Logic Gates, Operating Systems, A/L Theory,
  Revision, Student Voices, BICT Online — names sourced from verified lesson titles).
  Hover shows an HTML label; click opens the matching lesson/LMS. Inertial drag,
  auto-rotate, `touch-action: pan-y` so vertical scrolling still works on mobile.
  Equivalent plain buttons below the canvas keep the section keyboard/screen-reader
  accessible.
- **Community section** (`Community.tsx`): animated counters for verified live stats
  (YouTube 80K subscribers · 332 videos; Facebook 152K followers · 100% recommend),
  TikTok link (handle verified via the Facebook intro; stats unverifiable — not shown),
  and four "Latest lessons" cards with real video titles/thumbnails linking to YouTube.
- Micro-interactions: pointer-tilt on batch/promo/stat/video cards (`useTilt` — disabled
  on touch and for reduced motion), scroll progress bar, navbar scrollspy highlighting.
- `three` is dynamically imported and code-split (lazy ~185 KB-gzip chunk) — the initial
  bundle is unaffected until a canvas actually mounts.

### Fixed
- `SectionHeading` now renders the `id` referenced by each section's `aria-labelledby`
  (ids were previously missing from the DOM).

### QA (2026-08-26, production build, Chromium)
- 0 console errors / warnings with both WebGL scenes running.
- Hero canvas mounted (DPR-capped), Core canvas mounted; drag simulation spins the core;
  hover label renders with correct topic text.
- Counters animate to 80K / 152K / 100%; all 4 YouTube thumbnails load.
- No horizontal overflow at 320 px / 390 px; core canvas mounts on mobile at 343 px.

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
