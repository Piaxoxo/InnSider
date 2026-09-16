/**
 * Optimised twins of every photograph.
 *
 * Every JPEG in the project has four siblings, generated at build-prep time and
 * committed alongside it:
 *
 *   x-sm.avif / x-sm.webp   — capped at 1000px, for phones and the 3-D slabs
 *   x-lg.avif / x-lg.webp   — capped at 2000px, for desktop and full-bleed
 *
 * The naming is by purpose, not by pixel count, because a portrait original is
 * only 1333px wide — a file called `-2000` would be lying, and a lying width
 * descriptor in a srcset makes the browser pick the wrong file.
 *
 * For the same reason the <picture> below switches on a media query rather than
 * on `w` descriptors: no intrinsic width has to be declared, so nothing can be
 * wrong. AVIF first, WebP second, the untouched JPEG as the floor.
 *
 * Typical saving on this set: a phone pulls 1.3 MB instead of 12.4 MB.
 */

export interface PhotoSources {
  /** AVIF, capped at 1000px */
  smAvif: string
  /** WebP, capped at 1000px — the safe choice for WebGL textures */
  smWebp: string
  /** AVIF, capped at 2000px */
  lgAvif: string
  /** WebP, capped at 2000px */
  lgWebp: string
}

/** The breakpoint below which the small variant is enough. */
export const SMALL_UP_TO = '(max-width: 760px)'

/**
 * Derive the four twins of a photo URL by path.
 *
 * Works for anything served from /public (the path survives into the URL).
 * Bundled photos are hashed by Vite, so their twins cannot be derived — those
 * carry their sources with them (see content/pools.ts).
 */
export function derivePhotoSources(src: string): PhotoSources | null {
  const m = /^(.*)\.(jpe?g|png)$/i.exec(src)
  if (!m) return null
  const base = m[1]
  return {
    smAvif: `${base}-sm.avif`,
    smWebp: `${base}-sm.webp`,
    lgAvif: `${base}-lg.avif`,
    lgWebp: `${base}-lg.webp`,
  }
}
