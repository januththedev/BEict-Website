# BEICT Website

Public website for **BEICT — Bhanuka Ekanayaka ICT**: G.C.E. Advanced Level ICT tuition in
Sinhala medium, with the online learning system at [lms.beict.lk](https://lms.beict.lk/).

Built with **Vite + React 19 + TypeScript + Tailwind CSS v4**. Fully static output — deployable
to any static host (Cloudflare Pages, Netlify, nginx, …).

## Getting started

```bash
npm install
npm run dev       # local dev server
npm run build     # typecheck + production build → dist/
npm run preview   # serve the production build locally
```

## Content policy — READ BEFORE EDITING

Every fact published on this site (phone number, email, hours, social links, batch names,
the Sinhala LMS invite) is **verified** against public sources. See
[CONTENT-AUDIT.md](CONTENT-AUDIT.md) for the fact-by-fact source list.

**Rule: if a claim cannot be verified, it does not ship.** Do not add statistics, results,
ranks, venue names or testimonials that are not in the audit file.

All site copy lives in one typed file: [`src/data/content.ts`](src/data/content.ts).
Edit content there — not inside components.

## Structure

```
src/
├── components/       # Navbar, Hero, About, Batches, CoreSection, LmsSection,
│   │                 # PromoBanners, Community, Contact, Footer, ScrollProgress
│   ├── Icons.tsx     # inline SVG icon set (no icon library)
│   ├── Logo.tsx      # inline SVG brand mark
│   ├── HeroCanvas.tsx# WebGL hero backdrop wrapper (SVG-grid fallback)
│   └── ui.tsx        # shared buttons, Reveal (scroll fade-up), SectionHeading
├── three/            # Three.js scenes (dynamically imported, lazy chunk)
│   ├── runSceneCanvas.ts  # shared loop: DPR cap, auto-pause, dispose
│   ├── HeroField.ts       # pointer-parallax particle network
│   └── CoreScene.ts       # interactive draggable "BEICT Core"
├── data/content.ts   # single source of truth for all copy & links
├── hooks/            # useReveal, useInView/useCountUp, useTilt
├── App.tsx           # page composition
├── main.tsx          # entry; imports self-hosted fonts (@fontsource)
└── index.css         # Tailwind v4 @theme tokens (brand blues, navy, fonts) + reveal CSS
scripts/
└── generate-images.mjs  # regenerates og-image.png + banners/*.webp from SVG (uses sharp)
public/
├── favicon.svg, robots.txt, sitemap.xml
└── images/           # og-image.png, banners/*.webp
qa/                   # browser QA screenshots taken during the 2026-08-26 build
```

## Interactive (WebGL) sections

- **Hero field** and **BEICT Core** use Three.js, loaded via dynamic `import()` so the
  core page bundle never includes it. Both scenes pause automatically when off-screen or
  when the tab is hidden, cap `devicePixelRatio` at 1.75, and fully dispose on unmount.
- Every 3D feature degrades gracefully: no WebGL or `prefers-reduced-motion` means the
  static SVG grid / plain buttons are used instead — no content is ever locked behind
  WebGL. All core topics are duplicated as real links below the canvas.

## LMS integration (by design)

The LMS is **not** part of this website. `lms.beict.lk` (Moodle) is linked externally —
navbar button, hero CTA, LMS section, batch cards, promo banner and footer all open
`https://lms.beict.lk/` in a new tab with `rel="noopener noreferrer"`. Authentication,
courses and progress live entirely on the LMS platform.

## Design system

- Light & academic identity: white surfaces, `brand` blue scale (`#1e4fd8` primary),
  `navy` dark bands for the LMS section/footer, ice-tinted section alternation.
- Fonts: **Sora** (display), **Inter** (body), **Noto Sans Sinhala** (Sinhala invite) —
  self-hosted via `@fontsource-variable/*` (no third-party font CDN at runtime).
- Motion: minimal CSS fade-up reveals via `useReveal`; everything is instant under
  `prefers-reduced-motion`.

## Regenerating image assets

```bash
node scripts/generate-images.mjs
```

Requires `npm install` first (uses `sharp`, dev-dependency).

## Known limitations

- The contact form composes an email in the visitor's mail app (`mailto:` to the address in
  `content.ts`) — there is no backend. Wire a form service if server-side submission is needed.
- Live `beict.lk` hosting was unreachable/bot-blocked during the 2026-08-26 build; content
  was verified via Wayback Machine captures instead (see CONTENT-AUDIT.md). Re-verify against
  the live site when hosting is restored.
