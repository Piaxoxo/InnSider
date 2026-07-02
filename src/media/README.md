# Auto-scaling photo pools

Drop images into these folders and they render automatically — **any number,
any filename, mixed portrait/landscape.** No code changes per photo. Vite picks
them up at build time (`import.meta.glob`), sorts them by filename, hashes and
optimises them.

```
src/media/rooms/     → Chapter 7 "The Rooms"  — interiors, details, the space
src/media/moments/   → Chapter 8 "Occasions"  — events, guests, celebrations, nightlife
```

## How to add photos

1. Save your images into the folder above.
2. Name them however you like. To control order, number them: `01.jpg`,
   `02.jpg`, `10.jpg` (natural sort, so `10` comes after `9`).
3. Rebuild / redeploy. That's it.

Formats: `.jpg .jpeg .png .webp .avif`.

## Behaviour

- **Empty folder** → that chapter shows its curated placeholder layout, so the
  design never looks unfinished.
- **One or more files** → the chapter switches to an auto-scaling masonry wall
  that lays out however many photos you dropped in, with captions cycled across
  them.

This is the place for the big event / nightlife / interior library. For the few
**singular, specifically-captioned frames** (the facade, Alice, Chef Stefan,
the named menu dishes), use the exact-filename slots documented in
`public/media/README.txt` instead.
