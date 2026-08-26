# Changelog

All notable changes to this project are documented here.

## 2.1.0 — 2026-08-26 · Neon Postgres as the CMS database

Matching the previous CMS architecture: **Neon Postgres stores content, Vercel Blob
stores media**.

### Added
- `DATABASE_URL` env var (Neon pooled connection string) — when set, CMS content is
  stored in a `cms_content` jsonb table and login throttling becomes persistent
  (`cms_login_throttle`, 10 attempts / 10 min per IP, surviving cold starts).
- `src/cms/server/db.ts` — Neon access layer; both tables self-migrate on first use
  (idempotent), reference schema in `cms.sql`.
- Storage precedence: **Neon → Vercel Blob → localStorage (dev)**. Blob-only
  deployments and local dev keep working unchanged.
- `@neondatabase/serverless` dependency (server functions only — client bundle
  unchanged).

### Changed
- `api/content.ts` reads/writes Neon first, falls back to Blob.
- `api/login.ts` uses the DB-backed throttle when available (was in-memory only).
- README-CMS.md setup now includes the Neon step; `.env.example` adds `DATABASE_URL`.

## 2.0.0 — 2026-08-26 · Aug update — built-in CMS (Wix-style structured builder)

The site now has its own click-to-edit CMS at **`/admin`**, powered by the admin
password stored in Vercel environment variables (never in the code).

### Added
- **Click-to-edit everything**: 86+ text fields across every section — click the text
  on the real page and type. Long text edits inline (multiline) or via the fields panel.
- **Add / remove / duplicate / reorder**: batch cards, LMS point cards, banner cards,
  community stats, lesson videos, about facts — each list has "+ Add" and per-item
  ↑ ↓ ⧉ ✕ controls.
- **Image uploads**: banner images upload to Vercel Blob from the admin
  (png/jpg/webp/gif/svg, ≤5 MB) with preview/replace/reset.
- **Icon picker**: any icon slot swaps between 16 built-in icons.
- **Links**: button/card/social/phone/WhatsApp/LMS targets are editable fields.
- **Sections panel**: show/hide and reorder whole sections; per-section reset to
  defaults; hidden sections keep their content.
- **Auth**: `POST /api/login` compares against the `ADMIN_PASSWORD` env variable
  server-side (timing-safe) and issues a signed HttpOnly session cookie (7 days,
  per-IP rate limiting). Password never reaches the browser.
- **Storage**: validated content JSON in Vercel Blob (`cms/content.json`); the public
  site picks up published changes within seconds (edge-cached GET).
- **Structure lock**: `PUT /api/content` validates every payload against
  `src/cms/schema.ts` — unknown fields are dropped, URL schemes whitelisted
  (https/tel/mailto/#//), list counts capped. No add/delete/restyle of layout is
  possible from the CMS.
- Local dev fallback: without Vercel env vars, content persists to localStorage and
  uploads become inline data URLs — the full admin flow works offline.
- `vercel.json` (SPA rewrite for /admin), `.env.example`, `README-CMS.md` with the
  exact Vercel dashboard setup (Blob store + 3 env vars + redeploy).
- `package.json` version → **2.0.0**.

### QA (2026-08-26, production build, Chromium)
- Public site pixel-identical when logged out (defaults render; no edit chrome).
- Admin: login (dev fallback), inline text edit committed on blur, unsaved-changes
  badge + beforeunload guard, add card 3→4 and delete 4→3, icon picker (16 icons),
  section hide/show, publish → localStorage persistence → public site shows the edit.
- 0 unexpected console errors (only the expected 404s for /api/* in local dev).

## 1.2.0-beta — 2026-08-26

Design-soul pass on top of 1.1.0-beta, per owner feedback. (Beta began with the
instruction "don't push; revert point `2c59529`" — the owner later asked for everything
to be pushed, so all beta commits are on GitHub as of `7629e5f`.)

### Changed
- **Removed the "BEICT Core" 3D section** entirely (component, scene, topic data) —
  owner decision. The hero WebGL field and Community section stay.
- **Navbar is now a floating glass pill** — detached from the viewport edge, blurred
  backdrop, denser on scroll; the mobile menu is a floating rounded glass card.
- **Hero copy sits in a glassmorphism panel** so the WebGL particle field never hurts
  text clarity.
- **Typography soul**: Instrument Serif italic joins the system as an accent voice
  (self-hosted) — used for the hero eyebrow line, the teacher's name, and select title
  words; a highlighter-pen `.text-highlight` marks key phrases; section eyebrows gained
  editorial numbers (01–05) and About/Batches headings are left-aligned for rhythm.
- **Copy rewritten in a human voice** throughout (hero, About, Batches, LMS band,
  Community, Contact, footer) — same verified facts, warmer wording, no invented claims.

### QA (2026-08-26, production build, Chromium)
- 0 console errors / warnings; no horizontal overflow at 390 px.
- Core section confirmed removed from the DOM; pill navbar, glass hero panel, serif
  accents and highlight marks all verified rendering; glass mobile menu opens.
- Screenshots: `qa/qa-beta2-hero-glass.png`, `qa/qa-beta2-about.png`.

## 1.1.0-beta — 2026-08-26

Interactive/WebGL upgrade.

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
