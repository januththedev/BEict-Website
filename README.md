# BEICT — Bhanuka Ekanayaka ICT

Modern rebuild of [beict.lk](https://beict.lk/) — the website of **Bhanuka Ekanayaka ("Bhanuka Sir")**, teacher of Information & Communication Technology for G.C.E. Advanced Level students in Sri Lanka.

White & blue identity with gradient accents and a **Z-scroll journey** where
scrolling flies the camera through textured interactive glTF models. Site copy
is research-driven: verified from beict.lk plus Bhanuka Sir's own public
Facebook / YouTube / TikTok profiles (checked 2026-08-25).

## Tech stack

- **Vite + React 19** (JavaScript/JSX)
- **Tailwind CSS v4** (tokens in `src/index.css` via `@theme`)
- **three.js + @react-three/fiber + @react-three/drei** — 3D lab & hero model
- **framer-motion** — scroll reveals & hero entrance

## Getting started

```sh
npm install
npm run dev       # dev server
npm run build     # production build → dist/
npm run preview   # serve the production build
npm run models    # regenerate the glTF models into public/models/
```

## Project structure

```
├── index.html                  # SEO meta, fonts, favicon
├── scripts/generate-models.mjs # hand-written glTF 2.0 generator (no deps)
├── public/
│   ├── models/*.gltf           # generated 3D models (chip / globe / database)
│   └── images/                 # real assets from the old site + gallery/
└── src/
    ├── data/content.js         # ALL text/facts — edit content here
    ├── components/             # Navbar, Hero, LmsBanner, About, Features,
    │                           # ScrollJourney, Community, Banners, Gallery,
    │                           # Contact, Footer, ui.jsx
    └── three/                  # SafeCanvas, StudioEnvironment, useModelParts,
                                # textures, HeroScene, JourneyScene, JourneyCanvas
```

## The full-site Z-scroll (v2.0.0)

The whole site is **one cinematic flight**. Lenis smooth-scrolls a 1500vh
track behind a single persistent 3D canvas (`src/three/StageCanvas.jsx` +
`WorldScene.jsx`); the scene palette lerps bright white → deep navy → light.

Chapters (scroll spans in `src/data/content.js → CHAPTERS`):

1. **Hero + Identity + Track record** — `setpieces/Workstation.jsx`: procedural
   laptop / mechanical keyboard / tower with floating 3D name typography that
   explodes along Z — keycaps become syllabus badges, the tower opens its
   module plates, and the parts align beside the verified track record.
2. **Neural Core** — `setpieces/NeuralCore.jsx`: a holographic glass sphere
   peels layer-by-layer (background → methodology circuits → stats heart),
   then condenses into an Enroll Now trigger.
3. **Syllabus Vault** — `setpieces/Vault.jsx`: a server rack ejects three
   cartridges — Hardware (textured CPU + RAM), Networking (OSI 7-layer stack),
   Software (code blocks + binary switch array).
4. **Sri Lanka map** — `setpieces/LankaMap.jsx`: extruded 1,900-point island
   (`public/models/sri-lanka-main.json`) with six pins at the real Google Maps
   coordinates of every class hub — clicking a pin or a list entry opens that
   centre's Maps listing.
5. **Community** — stat panels over the starfield.
6. **3D Gallery** — `setpieces/GalleryPlanes.jsx`: the eight class photos as
   framed planes in a spiral fly-through.
7. **Soft landing** — the scene fades to white; LMS banner, ad slots, contact
   and footer return to normal flow.

Gotchas encoded in the code: the lazy boundary wraps the whole Canvas; chapter
panels write styles from the shared progress MotionValue (no framer
useTransform styles — WAAPI offset crash); the 3D world reads a plain progress
ref (React context does not cross the Canvas root).

## The 3D models

The models are generated as **real glTF 2.0 files** (JSON + embedded base64
buffers, PBR materials, named node hierarchy) by `npm run models` — no
modelling tools or extra dependencies.

- `cpu-chip.gltf` — substrate, gold pins, die, heat spreader, capacitors
  (reused inside the Vault's Hardware cartridge; parts are named nodes)

A procedural environment map (`StudioEnvironment`, three's RoomEnvironment)
gives the metals reflections with no network assets, and
`src/three/textures.js` layers **procedural canvas textures** onto every part —
PCB traces on the substrate, luminous circuit blocks on the die, city-dot
continents on the globe core, data bands on the disks (the geometry builders
emit real UV coordinates / TEXCOORD_0).

## Ad banners

The “Latest from BEICT” strip (`Banners.jsx`, above Contact) has three slots.
To publish your social-media ads on the site, drop the same creatives in:

```
public/images/banners/banner-1.jpg   # links to the Facebook page
public/images/banners/banner-2.jpg   # links to lms.beict.lk
public/images/banners/banner-3.jpg   # links to the WhatsApp chat
```

Until an image exists, each slot shows a built-in gradient promo design.
Copy, links and placement are configured in `src/data/content.js → BANNERS`.

## Content rules

`src/data/content.js` is the single source of truth. Facts are limited to two
verified sources: beict.lk / lms.beict.lk, and Bhanuka Sir’s own public
profiles as of 2026-08-25 — Facebook page (152K followers, Horana,
070 100 7003), YouTube @BhanukaEkanayaka (80K subscribers, 332 videos,
six class venues in video descriptions), TikTok @bhanuka_sir_official
(19K followers, 713K+ likes), Telegram t.me/bealict. **Do not invent prices,
schedules or testimonials beyond these.** The contact form has no backend — it
composes a message in the visitor's email app via `mailto:`.

## Deployment

`npm run build` outputs a fully static `dist/` — hostable on Netlify, Vercel,
GitHub Pages, or any static server. Point the domain at it and update the
`canonical` URL in `index.html` if the domain changes.

## Known limitations

- No backend: the contact form opens the visitor's email app (no stored messages).
- Class times / pricing intentionally absent (not published on the source site).
- `THREE.Clock` deprecation warning comes from inside `@react-three/drei` — harmless.
