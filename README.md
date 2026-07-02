# InnSider — a cinematic digital experience

A luxury-hospitality website for **InnSider** (Vienna, Meidling), built as one
uninterrupted cinematic scroll rather than a set of sections. The visitor
doesn't browse a menu — they walk through an evening, and the room re-lights as
the night unfolds.

Content, positioning and Alice Kern's story are elevated from the current
InnSider site (innsider-restaurant.at); Chef Stefan is woven in as the heart to
Alice's soul. Nothing about the restaurant's identity was invented or replaced.

## Stack

- **Vite + React + TypeScript**
- **React Three Fiber / three.js** — the persistent WebGL atmosphere (fog, light, dust)
- **GSAP + ScrollTrigger** — scroll-driven reveals and pinned sequences
- **Lenis** — smooth, luxurious scrolling (synced to the GSAP ticker)
- **Framer Motion** — the loader, menu overlay and micro-interactions

## Run

```bash
npm install
npm run dev        # local dev
npm run build      # typecheck + production build → dist/
npm run preview    # preview the production build
```

## The idea, in code

- **One WebGL context, always alive.** `src/three/` renders a single fixed
  fullscreen fragment shader (`atmosphereShader.ts`) plus drifting dust. As you
  scroll, the palette lerps between per-chapter "grades" defined in
  `content/palette.ts` — golden hour → fire → deep wine → the dark bar →
  blue-black night → a warm return. This is the cinematic through-line, done
  cheaply enough to hold 60fps instead of nine heavy 3D scenes.
- **Nine chapters** live in `src/chapters/`, one file + one stylesheet each,
  matching the nine-chapter brief (Hero, Dream, Kitchen, Menu, Bar, Evening,
  Gallery, Events, Reservation).
- **All copy is centralised** in `src/content/site.ts`. Components are purely
  presentational — rewrite the story in one place.

## Dropping in real photography & video

Professional photo/video is intentionally deferred. Every media slot is
declared in **`src/content/assets.ts`** with its aspect ratio and an
art-direction brief, and rendered by **`src/components/Placeholder.tsx`** as a
premium, labelled placeholder until the real asset arrives.

To go live with a real asset:

1. Drop the file into `public/media/` (e.g. `public/media/alice-portrait.jpg`).
2. Set that slot's `src` in `assets.ts` (e.g. `src: '/media/alice-portrait.jpg'`).

Because each slot reserves its exact aspect ratio, **nothing reflows and no
animation timing changes** when the real asset appears — the design was built
around the photography, not dependent on it.

## Craft notes

- **Accessibility.** Full `prefers-reduced-motion` support (smooth scroll,
  parallax, dust and shader motion all stand down), semantic landmarks, a skip
  link, keyboard-navigable menu and form, visible focus, and a warm-on-dark
  contrast palette.
- **Sound.** Off by default, never autoplayed. The toggle synthesises a soft
  room tone via the Web Audio API (no asset needed); swap in a real ambience
  track by setting `AMBIENCE_TRACK` in `src/lib/ambience.ts`.
- **Performance.** Single WebGL context, additive GPU points, transform/opacity
  animations only, dust count reduced on touch, heavy libs code-split.
- **Mobile** is a reflow of the same experience, not a stripped-down one.
