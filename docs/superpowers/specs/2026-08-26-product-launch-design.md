# BEICT "Product Launch" redesign — design spec (2026-08-26)

## Problem
The current Z-scroll reads ugly/busy: white→navy palette shifts, glassy cards,
a literal cartoon workstation with badge swarms, multi-colour accents. The user
chose the **Product Launch** direction (Apple-keynote style) from three options.

## Direction
Full dark keynote. One continuous void, one hero object per chapter, camera
choreography + sparse huge type carry everything.

## Language
- Canvas: `#04070f` → `#0a1428` subtle gradient via background/fog lerp. No white chapter.
- Type: headlines `clamp(2.8rem, 7vw, 6.5rem)`, white, tracking-tight, one
  gradient word (cyan→blue) per headline. Eyebrows: 1px rule + letterspaced caps.
- Panels: **no cards**. Text floats in the void (left or right third), sequenced
  line-by-line with scroll (each line mapped to a sub-range of the chapter).
- Accent: single cyan `#22d3ee` (+ gradient to `#3b82f6`). Orange reserved for
  map pins + the orange easter egg.
- Post: Bloom subtle (threshold 0.78, intensity 0.55), **no vignette**.

## Chapters (object → choreography)
0. **Hero** — the textured CPU chip centred, slow rotate, camera drifts.
   H1: "A/L ICT. *Taught right.*" + sub + 2 CTAs.
1. **About** — camera pulls back/around; chip explodes in slow motion; About
   text (portrait chip + name + 3 lines) right third.
2. **Track record** — exploded parts align into a clean orbital ring around
   centred huge stats (one stat per beat: 152K+ / 80K+ / 6 hubs / 2026·2027).
3. **Neural Core** — glass sphere (transmission + iridescence) peels:
   background → methodology circuits → stats heart → condenses into Enroll Now.
4. **Vault** — three cartridges eject one per beat, each pausing centred with
   its huge label; expansions (CPU+RAM / OSI stack / code+binary) per beat.
5. **Map** — extruded Sri Lanka + glowing pins (existing, restyled darker).
6. **Community** — huge numbers in sequence over starfield.
7. **Gallery** — photo planes fly-through (thinner frames).
8. **Landing** — stays dark: LMS strip, ad slots, contact (restyled dark), footer.

## Removed
Workstation setpiece (laptop/keyboard/tower/badges), GlassCard panels,
white hero/landing palette, vignette, per-chapter rainbow accent lights
(replaced by single cyan rim light + setpiece-local lights).

## Perf
Cached material lists (no per-frame traverses), early-exit when chapter
invisible, bloom at half-res mipmap, DPR [1,2].

## Verified-facts rule unchanged
No invented pass rates/schedules/testimonials.
