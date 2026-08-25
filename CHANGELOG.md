# Changelog

All notable changes to the BEICT website. Facts are limited to content verified
on beict.lk and Bhanuka Sir's own public social profiles; nothing invented.

## [1.2.0] — 2026-08-25

### Added
- **Research-driven content** — audited Bhanuka Sir's real public presence via
  browser automation: Facebook page (152K followers, “Leading ICT Teacher in
  Sri Lanka”, Horana, 070 100 7003), YouTube @BhanukaEkanayaka (80K subs,
  332 videos, six physical class venues in video descriptions, Telegram
  t.me/bealict), TikTok @bhanuka_sir_official (19.1K followers, 713K+ likes).
- **Community section** (`#community`) — real social-proof stat cards linking
  to each platform, plus the six island-wide class hubs (Zeon Opera Horana,
  Rotary Nugegoda, New Montana Gampaha, Pencil Opera Kurunegala, Sisulka
  Rathnapura, Gurumandala Kalutara) with `#venues` anchor.
- **Three ad-banner slots** (“Latest from BEICT”, above Contact) — drop the
  same creatives used on social media into `public/images/banners/banner-*.jpg`;
  until then each slot shows a built-in gradient promo design (Facebook /
  LMS / new-batch WhatsApp). Copy & links in `content.js → BANNERS`.
- **Procedural PBR textures** (`src/three/textures.js`) — canvas-generated PCB
  traces on the substrate, luminous circuit blocks on the die, city-dot
  continents + lat/long grid on the globe core, brushed-metal roughness on
  pins/capacitors, data bands on the database disks. Geometry builders now
  emit UV coordinates (TEXCOORD_0) — the previous models had none, which is
  why every texture rendered as a flat solid colour.
- Hero now quotes his real tagline; contact adds the Telegram channel; footer
  links Facebook / YouTube / TikTok / Telegram.

### Changed
- Z-scroll journey panels now carry the researched promo story instead of
  abstract topic blurbs: Theory Classes → Island-wide Network (all six venue
  chips) → BICT Online (LMS/Telegram CTAs). Each station has its own call-to-
  action button.

### Fixed during visual QA
- Models looked like solid untextured blocks: root cause was missing TEXCOORD_0
  in the generated glTF (textures sampled one texel). Geometry builders now
  emit per-primitive UVs and the generator writes the accessor.
- Ghost silhouette of the next station floating mid-flight — fog range
  tightened (10→46 → 8→27).
- Camera raised for a clearer top-down composition of the exploded chip;
  emissive glow boosted on die circuits and planet dots.

### Verified
- `npm run build` green; console free of errors; journey re-captured at all
  three stations plus hero/community/banners at desktop width; mobile 390 px
  overflow check clean.

## [1.1.0] — 2026-08-25

### Changed
- **Removed the "ICT 3D Lab" section** (tabbed model viewer) and replaced it
  with a **Z-scroll experience** ("Explore"): a 400svh scroll track with a
  sticky full-viewport canvas. Scrolling dollies the camera down the Z axis
  through the three glTF stations — CPU chip (explodes as you approach),
  network globe (spinning rings, pulsing nodes), database (disks spread).
  Story panels fade/parallax in sync with scroll; fog reveals each station
  from the dark. Nav link renamed "ICT 3D Lab" → "Explore" (`#explore`).
- `src/components/ScrollJourney.jsx` + `src/three/JourneyScene.jsx` +
  `src/three/JourneyCanvas.jsx` replace `ModelLab.jsx` + `LabViewer.jsx`.

### Fixed during visual QA
- App crashed on load: framer-motion v13 compiles `useTransform` style ranges
  into native WAAPI scroll timelines whose offsets must stay within the
  element's own [0,1] window — panel ranges span the whole section. Panels
  now subscribe to the scroll progress and set opacity/transform directly.
- 3D scene never mounted: a `React.lazy` component rendered as a child of
  `<Canvas>` suspends in R3F's second reconciler root where the outer
  Suspense can't catch it. The lazy boundary now wraps the whole Canvas
  (`JourneyCanvas.jsx`).
- Camera path was offset half a panel from the stations — replaced the linear
  z-lerp with keyframes aligned to panel centres (p = 0, ⅓, ⅔, 1).
- Lighting was overexposed on the dark stage (env 1.1 → 0.8, ambient/key
  reduced) so the models read brand-blue instead of washed-out white.

### Verified
- `npm run build` green; production build smoke-tested via `vite preview`:
  journey canvas mounts, stations render at all four scroll stops, no
  horizontal overflow, console free of errors.
- Visual review of the journey at 1440 px and 390 px (intro, chip, globe,
  database stops) plus the untouched sections.

## [1.0.0] — 2026-08-25

### Added
- Fresh Vite + React 19 + Tailwind CSS v4 rebuild of beict.lk in white/blue
  with gradient accents (brand tokens in `src/index.css`).
- Single-page structure: Navbar (scroll-spy, mobile menu), Hero, LMS banner,
  About, Learning features, ICT 3D Lab, Gallery, Contact, Footer.
- **ICT 3D Lab** — interactive glTF viewer (`src/components/ModelLab.jsx` +
  `src/three/LabViewer.jsx`): drag-rotate, scroll-zoom, hover part
  highlighting, click/button explode-assemble (CPU chip), idle animation,
  procedural RoomEnvironment lighting. Models lazy-mount near the viewport and
  the three.js bundle is code-split.
- **Real glTF 2.0 assets** generated by a dependency-free Node script
  (`scripts/generate-models.mjs` → `public/models/*.gltf`): CPU chip
  (5 named parts), network globe (rings + 8 satellite nodes), database stack.
- Floating CPU-chip scene in the hero (`src/three/HeroScene.jsx`).
- Contact form with inline validation, error/success states; sends via the
  visitor's email app (`mailto:`) since the site is static — declared in the UI.
- SEO: title/description, Open Graph, canonical, theme-color, SVG favicon.
- Accessibility: skip link, semantic landmarks, single h1, labelled fields with
  `role="alert"` errors, keyboard-closable mobile menu (Escape), focus-visible
  rings, `prefers-reduced-motion` disables reveals/auto-rotate/idle animation.
- README with architecture and content rules.

### Content (preserved from the existing site)
- Identity: Bhanuka Ekanayaka — G.C.E. A/L ICT.
- Sinhala LMS invite line kept verbatim; LMS link → https://lms.beict.lk/.
- Contact: 071 103 9004 (tel + WhatsApp), info@beict.lk.
- Real assets downloaded from the old site: teacher portrait (transparent PNG),
  original ICT logo (paired with a "BE" monogram), 8 classroom gallery photos.

### Fixed during visual QA (Chrome DevTools, 390/768/1440 px)
- Missing `Button` import crashed the Navbar on first load.
- Hero headline clipped horizontally on mobile (`&nbsp;` created an
  unbreakable unit) — replaced with normal spaces.
- Implicit single-column grid tracks could inflate past the viewport
  (hero, about, lab, contact grids) — explicit `grid-cols-1` (`minmax(0,1fr)`)
  added; verified no horizontal overflow at 390/768/1440.
- Duplicate `id="contact"` (section vs. form field) broke label association —
  field renamed to `reply-contact`.
- Metallic materials rendered black under direct lights — added procedural
  environment map (`StudioEnvironment`) and softened metalness values.

### Verified
- `npm run build` green (three.js chunk code-split, lazy-loaded).
- Production build smoke-tested via `vite preview`: all sections mount, 10/10
  images load (lazy), 3D canvas mounts on approach, console free of errors.
- Visual review at 390 / 768 / 1440 px: hero, nav + mobile menu, LMS banner,
  about, features, 3D lab (tab switching + explode), gallery, contact form
  (invalid + valid submission states), footer.

### Known limitations
- No backend: contact form composes email in the visitor's mail app.
- No class times/pricing (never published on the source site — not invented).
- `THREE.Clock` deprecation warning originates inside @react-three/drei.
