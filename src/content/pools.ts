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

export interface PoolImage {
  src: string
  name: string
}

function toPool(mods: Record<string, unknown>): PoolImage[] {
  return Object.entries(mods)
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([path, src]) => ({
      src: src as string,
      name: (path.split('/').pop() || '').replace(/\.[^.]+$/, ''),
    }))
}

export const pools = {
  rooms: toPool(
    import.meta.glob('../media/rooms/*.{jpg,jpeg,png,webp,avif}', { eager: true, import: 'default' }),
  ),
  moments: toPool(
    import.meta.glob('../media/moments/*.{jpg,jpeg,png,webp,avif}', { eager: true, import: 'default' }),
  ),
}

export type PoolName = keyof typeof pools
