/**
 * Auto-scaling photo pools.
 *
 * Drop any number of images into `src/media/<pool>/` and they are picked up at
 * build time by `import.meta.glob` — no code per photo, no fixed count. Files
 * are sorted naturally by filename (so `01`, `02`, `10` order correctly), and
 * Vite hashes + optimises them like any other asset.
 *
 * Empty pool → the consuming section falls back to its curated placeholders,
 * so the design never looks unfinished before photography is delivered.
 *
 * TO ADD PHOTOS: save them into
 *   src/media/rooms/    → Chapter 7, "The Rooms" (interiors, details)
 *   src/media/moments/  → Chapter 8, "Occasions" (events, guests, nightlife)
 * Any filename works; number them (01, 02, …) to control order.
 */

import type { PhotoSources } from '../lib/picture'

export interface PoolImage {
  src: string
  name: string
  /** Optimierte Zwillinge aus `<pool>/opt/` — siehe lib/picture.ts. */
  sources: PhotoSources | null
}

/**
 * Gebündelte Dateien bekommen von Vite einen Hash in den Namen, ihre Zwillinge
 * lassen sich also nicht aus dem Pfad ableiten. Deshalb wird der Unterordner
 * `opt/` getrennt eingelesen und über den Dateinamen zugeordnet.
 */
function toVariants(mods: Record<string, unknown>): Map<string, string> {
  const map = new Map<string, string>()
  for (const [path, url] of Object.entries(mods)) {
    // MIT Endung als Schlüssel: `moment-01-sm.avif` und `moment-01-sm.webp`
    // unterscheiden sich nur darin.
    map.set(path.split('/').pop() || '', url as string)
  }
  return map
}

function toPool(mods: Record<string, unknown>, variants: Map<string, string>): PoolImage[] {
  return Object.entries(mods)
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([path, src]) => {
      const name = (path.split('/').pop() || '').replace(/\.[^.]+$/, '')
      const pick = (suffix: string) => variants.get(`${name}-${suffix}`)
      const smAvif = pick('sm.avif')
      const smWebp = pick('sm.webp')
      const lgAvif = pick('lg.avif')
      const lgWebp = pick('lg.webp')
      return {
        src: src as string,
        name,
        sources:
          smAvif && smWebp && lgAvif && lgWebp ? { smAvif, smWebp, lgAvif, lgWebp } : null,
      }
    })
}

export const pools = {
  rooms: toPool(
    import.meta.glob('../media/rooms/*.{jpg,jpeg,png,webp,avif}', { eager: true, import: 'default' }),
    toVariants(
      import.meta.glob('../media/rooms/opt/*.{webp,avif}', { eager: true, import: 'default' }),
    ),
  ),
  moments: toPool(
    import.meta.glob('../media/moments/*.{jpg,jpeg,png,webp,avif}', { eager: true, import: 'default' }),
    toVariants(
      import.meta.glob('../media/moments/opt/*.{webp,avif}', { eager: true, import: 'default' }),
    ),
  ),
}

export type PoolName = keyof typeof pools
