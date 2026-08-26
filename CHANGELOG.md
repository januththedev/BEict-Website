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

## [Unreleased]
### Added
- Footer credit: “Developed by Januth Nimnal” linking to www.januth.dev.
- Git repository initialised; deployment via Vercel (auto-deploys on push).

## [Unreleased] — easter egg & motion polish
### Added
- 🍊 **Orange rain easter egg** — clicking Bhanuka Sir's portrait 5 times quickly
  (2 s window) erupts hundreds of physics-driven oranges from the photo across
  the entire site (`OrangeRain.jsx`, fixed canvas overlay, gravity + drag +
  spin + fade) with a playful page shudder. Disabled under reduced motion.
- Journey starfield — 160 drifting data-motes along the Z flight path for
  depth (`JourneyScene.jsx`).
### Changed
- Scroll reveals are snappier (0.45 s, smaller offset, trigger earlier via
  viewport margin, stagger halved) so fast scrolling never leaves sections
  looking half-empty.

## [2.0.0] — 2026-08-26 — Full-site Z-scroll

### The whole site is now one cinematic flight
- **Lenis smooth scrolling** drives the entire page; one persistent 3D stage
  (fixed canvas) lives behind a 1500vh scroll track. The scene palette lerps
  bright white → deep navy → light across the journey.
- **Ch.0–2 Exploding Workstation** — procedural laptop + mechanical keyboard
  (52 instanced keycaps) + tower with floating 3D name typography. Scrolling
  explodes it: the monitor pushes back as the bio backdrop, keycaps eject as
  8 labelled syllabus badges, module plates fan out and align into a grid
  beside the verified track record (152K FB · 80K YT/332 lessons · 6 hubs ·
  2026 & 2027 batches — no invented stats).
- **Ch.3 Neural Core** — holographic glass sphere peels layer-by-layer
  (background → glowing methodology circuits → stats heart) then condenses
  into a glowing Enroll Now trigger.
- **Ch.4 Syllabus Vault** — server rack with BEICT monogram ejects three
  cartridges: Hardware (textured CPU + RAM sticks), Networking (OSI 7-layer
  stack), Software (code blocks + binary switch array).
- **Ch.5 Sri Lanka map** — dead-accurate extruded island (1,900-point
  geoBoundaries outline, 63 KB) with six pulsing orange pins at the real
  Google Maps coordinates of every class hub; clicking a pin (or the list)
  opens the centre's Maps listing.
- **Ch.6 Community · Ch.7 3D gallery** — stat panels over the starfield, then
  the eight class photos as framed planes in a spiral fly-through.
- **Soft landing** — scene fades to white; LMS banner, ad slots, contact form
  and footer return to normal flow.
- Retired: globe + database models, old ScrollJourney/Features/Community/
  Gallery sections (content absorbed into chapters).

### Fixed
- 3D world frozen at hero state: the new App never wired
  `useMotionValueEvent` into the shared progress ref.
- Workstation module plates rendered outside the tower (local/world space mix).
- Mobile: 3D name typography overflowed narrow screens — setpiece now scales
  down and drops below the copy on phones.

## [3.0.0] — 2026-08-26 — "Product Launch" visual redesign
### Changed
- Full Apple-keynote dark language: one continuous near-black void (#04070f),
  no white chapters, no vignette, subtle bloom, huge editorial typography
  (one gradient word per headline), thin-rule eyebrows, sequenced line beats.
- Chapters 0–2 rebuilt around the textured CPU alone (ChipHero): centred hero
  → slow-motion explode → parts align into an orbital ring beside huge stats.
  The literal workstation setpiece removed.
- Neural Core upgraded: iridescent glass (iGPU-friendly — transmission pass
  removed), orbiting data motes, halo ring.
- Vault: jewel-tone cartridges with edge glows, rack light strips, holographic
  scan sweep. Map: darker island, ocean halo, route arcs from the home hub,
  pin light beams.
- Contact + banners restyled dark; navbar restyled dark; body background dark.
### Fixed
- Enroll Now button never hid after the Core chapter (photobombed later
  chapters and the footer).
- Community stats 2–3 never appeared (beat count mismatch).
- Hero beats were scroll-gated at p=0 — hero now animates on load.
- ChipHero missing useEffect import crashed the stage into its fallback.
- Vault monogram referenced a removed `fade` variable (threw every frame).
### Perf
- Transmission pass removed, DPR capped 1.5, MSAA 0 + no SMAA — iGPU-friendly.
- Verified 60fps in testing; per-frame material traverses cached.

## [3.1.0] — 2026-08-26 — White editorial pass
- Palette reverted to the brand's **white & blue**: clean white/ice world
  throughout (no dark chapters), dark-ink typography, blue gradient accents.
- Camera keyframes gained a per-chapter **frameX**: every setpiece is framed
  on the RIGHT of the screen, clear of the left-aligned copy (no more
  text/3D collisions). Mobile halves the offset.
- Chip polish: dark metallic capacitors, brighter substrate, contact shadow.
- Map/arc/beam/mote colours re-tuned for light background.

## [3.2.0] — 2026-08-26 — Glass pill nav + no-blank beats
### Changed
- **Floating glass pill navbar** — rounded translucent container with
  backdrop blur, detached from the page edge; mobile menu is a matching
  frosted sheet.
- **Glassmorphism where needed** — frosted panels behind the Vault/Map copy
  and glass tiles under the Community stats (legibility over busy 3D).
### Fixed
- **Blank sections**: chapter beats were scroll-gated so content was invisible
  for most of each chapter's scroll. Beats now stagger in fast and STAY
  visible until the chapter ends.
- Identity chapter name rendered white-on-white.

## [3.3.0] — 2026-08-26 — Gallery rebuild + copy fixes
### Changed
- **Identity chapter copy** per feedback: headline is now "Theory. Revision.
  Papers." and the body names Bhanuka Sir with how classes are conducted
  (six halls + BEICT LMS) instead of the long paragraph.
- **Gallery rebuilt as a scroll-driven DOM photo strip**: the eight class
  photos render as 2:3 vertical cards (white mat, rounded, tilted) that slide
  right-to-left with scroll. Replaces the 3D texture planes which rendered
  black (three.js texture path unreliable for these sources). Native
  `loading="lazy"`, zero texture-pipeline risk, fully accessible.
- Neural Core + camera framing pulled back so the glass sphere sits fully in
  frame beside the copy.
- Gallery chapter extended to 97% of the track (removes the long blank tail
  before the landing); stage fade retimed to the last 0.8%.
