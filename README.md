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

## The Z-scroll journey

The **Explore** section (`src/components/ScrollJourney.jsx`) replaces a
conventional 3D gallery: a 400svh scroll track with a **sticky full-viewport
canvas**. Scrolling dollies the camera down the Z axis (`JourneyScene.jsx`
keyframed camera rig) through three glTF stations while story panels fade in
and out in sync (`useScroll` → progress ref, styles set directly to avoid
framer-motion v13's WAAPI scroll-timeline path):

1. **CPU chip** — explodes (die lifts off substrate) as you approach
2. **Network globe** — rings spin, nodes pulse
3. **Database** — disks spread apart

Fog hides distant stations so each model emerges from the dark. The three.js
bundle lazy-loads only when the section is approached; the lazy boundary must
wrap the **whole Canvas** (`JourneyCanvas.jsx`) because R3F renders canvas
children in a second reconciler where an outer Suspense can't catch them.

## The 3D models

The models are generated as **real glTF 2.0 files** (JSON + embedded base64
buffers, PBR materials, named node hierarchy) by `npm run models` — no
modelling tools or extra dependencies.

- `cpu-chip.gltf` — substrate, gold pins, die, heat spreader, capacitors
  (parts are separate named nodes → scroll-driven explode + hover highlight)
- `network-globe.gltf` — core sphere, three tilted rings, 8 satellite nodes
- `database.gltf` — three stacked disks

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
