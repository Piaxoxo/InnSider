/**
 * The Memory Gallery catalog.
 *
 * Every delivered photo, grouped into the six rooms of memory and given a short
 * evocative caption (mood, never an invented fact). The 3-D flythrough streams
 * these in order so the category changes as you move through the space; the
 * reduced-motion fallback lays the same set out as a 2-D exhibition.
 *
 * Two photo sources are unified into one `url`:
 *   • public/media/*  — referenced by path, resolved against BASE_URL here
 *   • src/media/moments/* — bundled + hashed by Vite (via pools), already URLs
 */
import { pools } from './pools'
import { derivePhotoSources, type PhotoSources } from '../lib/picture'

export type MemoryCategory = 'Raum' | 'Kulinarik' | 'Bar' | 'Menschen' | 'Anlässe' | 'Details'

export interface Memory {
  url: string
  category: MemoryCategory
  caption: string
  /** Die optimierten Zwillinge des Fotos — siehe lib/picture.ts. */
  sources: PhotoSources | null
}

const BASE = import.meta.env.BASE_URL
const pub = (file: string) => `${BASE}media/${file}`

/**
 * Ein kuratiertes Foto aus /public. Die optimierten Varianten liegen unter
 * demselben Namen daneben, lassen sich also aus dem Pfad ableiten.
 */
const shot = (file: string, category: MemoryCategory, caption: string): Memory => {
  const url = pub(file)
  return { url, category, caption, sources: derivePhotoSources(url) }
}

// Ordered so the flythrough reads as an arrival: the room → the food → the bar →
// the people → the celebrations → the details.
const curated: Memory[] = [
  // ── Raum — the space ────────────────────────────────────────────────────
  shot('innsider-facade-guests.jpg', 'Raum', 'Die Fassade am Fenster'),
  shot('interior-nook-teal.jpg', 'Raum', 'Die Ecke'),
  shot('interior-bar-wide.jpg', 'Raum', 'Der ganze Raum'),

  // ── Kulinarik — the food ────────────────────────────────────────────────
  shot('craft-salad-macro.jpg', 'Kulinarik', 'Die Handschrift der Küche'),
  shot('dish-radicchio.jpg', 'Kulinarik', 'Knackig & saisonal'),
  shot('dish-peach-burrata.jpg', 'Kulinarik', 'Ein Sommer auf dem Teller'),
  shot('dish-fish-risotto.jpg', 'Kulinarik', 'Frisch angerichtet'),
  shot('dish-beet-1.jpg', 'Kulinarik', 'Rote Bete & Ziegenkäse'),
  shot('dish-beet-2.jpg', 'Kulinarik', 'Mit Liebe angerichtet'),
  shot('dish-chicken-wrap.jpg', 'Kulinarik', 'Vom Mittagstisch'),
  shot('season-soup.jpg', 'Kulinarik', 'Suppe des Tages'),
  shot('season-salad.jpg', 'Kulinarik', 'Aus dem Garten'),

  // ── Bar — the drinks ────────────────────────────────────────────────────
  shot('cocktail-aperol.jpg', 'Bar', 'Der erste Spritz'),
  shot('bar-guest-aperol.jpg', 'Bar', 'Goldene Stunde'),
  shot('bar-cheers.jpg', 'Bar', 'Auf den Abend'),
  shot('wine-pour-table.jpg', 'Bar', 'Ein Glas, geteilt'),
  shot('beer-taps.jpg', 'Bar', 'Frisch gezapft'),
  shot('wine-fridge-brueckner.jpg', 'Bar', 'Aus dem Keller'),
  shot('bar-counter-detail.jpg', 'Bar', 'Am Tresen'),

  // ── Menschen — the people ───────────────────────────────────────────────
  shot('stefan-portrait.jpg', 'Menschen', 'Chef Stefan'),
  shot('server-table.jpg', 'Menschen', 'Gastgeben'),
  shot('guest-portrait.jpg', 'Menschen', 'Willkommen'),

  // ── Anlässe — the celebrations ──────────────────────────────────────────
  shot('event-welcome.jpg', 'Anlässe', 'Ankommen'),
  shot('event-champagne.jpg', 'Anlässe', 'Zum Feiern'),
  shot('event-gathering.jpg', 'Anlässe', 'Die lange Tafel'),
  shot('event-dinner.jpg', 'Anlässe', 'Tief im Abend'),
  shot('event-embrace.jpg', 'Anlässe', 'Wiedersehen'),

  // ── Details ─────────────────────────────────────────────────────────────
  shot('season-rose.jpg', 'Details', 'Liebe zum Detail'),
]

// Every "moment" (event snapshot) joins the Anlässe room with a rotating,
// mood-only caption — no fabricated specifics.
const momentCaptions = [
  'Ein Abend unter Freunden',
  'Lachen am Tisch',
  'Der Anstoß',
  'Mitten im Fest',
  'Gemeinsam feiern',
  'Ein Hoch',
  'Nähe',
  'Bis spät in die Nacht',
  'Erinnerungen entstehen',
  'Das Fest',
  'Zusammen',
  'Ein besonderer Moment',
  'Freude, geteilt',
  'Der Abend gehört euch',
]

const moments: Memory[] = pools.moments.map((m, i) => ({
  url: m.src,
  category: 'Anlässe' as const,
  caption: momentCaptions[i % momentCaptions.length],
  sources: m.sources,
}))

// Slot the moments in right after the curated Anlässe block, before Details, so
// the celebrations stay together as one long, warm stretch of the flythrough.
const detailStart = curated.findIndex((m) => m.category === 'Details')
export const memories: Memory[] =
  detailStart === -1
    ? [...curated, ...moments]
    : [...curated.slice(0, detailStart), ...moments, ...curated.slice(detailStart)]

export const memoryCategories: MemoryCategory[] = [
  'Raum',
  'Kulinarik',
  'Bar',
  'Menschen',
  'Anlässe',
  'Details',
]
