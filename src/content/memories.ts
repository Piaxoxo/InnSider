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

export type MemoryCategory = 'Raum' | 'Kulinarik' | 'Bar' | 'Menschen' | 'Anlässe' | 'Details'

export interface Memory {
  url: string
  category: MemoryCategory
  caption: string
}

const BASE = import.meta.env.BASE_URL
const pub = (file: string) => `${BASE}media/${file}`

// Ordered so the flythrough reads as an arrival: the room → the food → the bar →
// the people → the celebrations → the details.
const curated: Memory[] = [
  // ── Raum — the space ────────────────────────────────────────────────────
  { url: pub('innsider-facade-guests.jpg'), category: 'Raum', caption: 'Die Fassade am Fenster' },
  { url: pub('interior-nook-teal.jpg'), category: 'Raum', caption: 'Die Ecke' },
  { url: pub('interior-bar-wide.jpg'), category: 'Raum', caption: 'Der ganze Raum' },

  // ── Kulinarik — the food ────────────────────────────────────────────────
  { url: pub('craft-salad-macro.jpg'), category: 'Kulinarik', caption: 'Die Handschrift der Küche' },
  { url: pub('dish-radicchio.jpg'), category: 'Kulinarik', caption: 'Knackig & saisonal' },
  { url: pub('dish-peach-burrata.jpg'), category: 'Kulinarik', caption: 'Ein Sommer auf dem Teller' },
  { url: pub('dish-fish-risotto.jpg'), category: 'Kulinarik', caption: 'Frisch angerichtet' },
  { url: pub('dish-beet-1.jpg'), category: 'Kulinarik', caption: 'Rote Bete & Ziegenkäse' },
  { url: pub('dish-beet-2.jpg'), category: 'Kulinarik', caption: 'Mit Liebe angerichtet' },
  { url: pub('dish-chicken-wrap.jpg'), category: 'Kulinarik', caption: 'Vom Mittagstisch' },
  { url: pub('season-soup.jpg'), category: 'Kulinarik', caption: 'Suppe des Tages' },
  { url: pub('season-salad.jpg'), category: 'Kulinarik', caption: 'Aus dem Garten' },

  // ── Bar — the drinks ────────────────────────────────────────────────────
  { url: pub('cocktail-aperol.jpg'), category: 'Bar', caption: 'Der erste Spritz' },
  { url: pub('bar-guest-aperol.jpg'), category: 'Bar', caption: 'Goldene Stunde' },
  { url: pub('bar-cheers.jpg'), category: 'Bar', caption: 'Auf den Abend' },
  { url: pub('wine-pour-table.jpg'), category: 'Bar', caption: 'Ein Glas, geteilt' },
  { url: pub('beer-taps.jpg'), category: 'Bar', caption: 'Frisch gezapft' },
  { url: pub('wine-fridge-brueckner.jpg'), category: 'Bar', caption: 'Aus dem Keller' },
  { url: pub('bar-counter-detail.jpg'), category: 'Bar', caption: 'Am Tresen' },

  // ── Menschen — the people ───────────────────────────────────────────────
  { url: pub('stefan-portrait.jpg'), category: 'Menschen', caption: 'Chef Stefan' },
  { url: pub('server-table.jpg'), category: 'Menschen', caption: 'Gastgeben' },
  { url: pub('guest-portrait.jpg'), category: 'Menschen', caption: 'Willkommen' },

  // ── Anlässe — the celebrations ──────────────────────────────────────────
  { url: pub('event-welcome.jpg'), category: 'Anlässe', caption: 'Ankommen' },
  { url: pub('event-champagne.jpg'), category: 'Anlässe', caption: 'Zum Feiern' },
  { url: pub('event-gathering.jpg'), category: 'Anlässe', caption: 'Die lange Tafel' },
  { url: pub('event-dinner.jpg'), category: 'Anlässe', caption: 'Tief im Abend' },
  { url: pub('event-embrace.jpg'), category: 'Anlässe', caption: 'Wiedersehen' },

  // ── Details ─────────────────────────────────────────────────────────────
  { url: pub('season-rose.jpg'), category: 'Details', caption: 'Liebe zum Detail' },
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
