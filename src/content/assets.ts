/**
 * DEFERRED MEDIA MANIFEST
 * ───────────────────────
 * Professional photography & video will be delivered later. Until then every
 * media slot renders a premium placeholder (see components/Placeholder.tsx).
 *
 * TO GO LIVE WITH REAL ASSETS:
 *   1. Drop the file into /public/media/ using the `src` path below.
 *   2. That's it — layouts are sized by aspect ratio, not by the image, so
 *      nothing shifts and no animation breaks when the real asset appears.
 *
 * Every slot declares its intended `ratio` and a `note` describing the shot,
 * so a photographer/editor can shoot to spec. `src` is null until delivered.
 */

export interface MediaSlot {
  id: string
  kind: 'image' | 'video'
  ratio: number // width / height — reserves layout space so real assets drop in cleanly
  label: string // shown on the placeholder
  note: string // art-direction brief for the shoot
  src: string | null // set to '/media/…' when the real asset is delivered
}

const slot = (
  id: string,
  kind: MediaSlot['kind'],
  ratio: number,
  label: string,
  note: string,
): MediaSlot => ({ id, kind, ratio, label, note, src: null })

// A slot pre-wired to a real, delivered asset. If the file isn't on disk yet
// the Placeholder falls back to the stub, so this is always safe to set.
const live = (
  id: string,
  ratio: number,
  label: string,
  note: string,
  src: string,
): MediaSlot => ({ id, kind: 'image', ratio, label, note, src })

// Aspect ratio of the delivered brand photography (all landscape 3:2).
const R = 3 / 2

export const media = {
  heroAmbient: slot('hero-ambient', 'video', 16 / 9, 'Hero film', 'Slow push through the candlelit room at golden hour — steam, glass, light rays.'),

  alicePortrait: slot('alice-portrait', 'image', 3 / 4, 'Alice Kern', 'Editorial portrait, warm window light, quiet and confident — not corporate.'),
  // DELIVERED — the InnSider facade: guests at the window counters, brick and
  // brass, summer light. The dream become a room you can walk into.
  aliceRoom: live('alice-room', R, 'The room she built', 'InnSider facade — guests at the window, brick, brass, summer light.', '/media/innsider-facade-guests.jpg'),

  stefanPortrait: slot('stefan-portrait', 'image', 3 / 4, 'Chef Stefan', 'At the pass, mid-motion, steam and fire behind — the heart of the kitchen.'),
  stefanHands: slot('stefan-hands', 'image', 4 / 5, 'The craft', 'Macro of hands plating — herbs, sauce, tension of the final touch.'),
  kitchenFire: slot('kitchen-fire', 'video', 16 / 9, 'Kitchen motion', 'Loop: flame, knife, steam — cinematic, shallow depth of field.'),

  dishHero: slot('dish-hero', 'image', 4 / 5, 'Signature plate', 'Overhead, cinematic, single hero dish on stone — steam optional.'),
  dish2: slot('dish-2', 'image', 1, 'Plate detail', 'Close macro, texture and sauce, shallow focus.'),
  dish3: slot('dish-3', 'image', 1, 'Plate detail', 'Close macro, contrasting colour and texture.'),

  cocktail1: slot('cocktail-1', 'image', 3 / 4, 'Signature cocktail', 'Dark background, single light source, ice and reflection.'),
  cocktail2: slot('cocktail-2', 'image', 3 / 4, 'Signature cocktail', 'Golden reflection, smoke or citrus twist.'),
  barMotion: slot('bar-motion', 'video', 16 / 9, 'Bar motion', 'Loop: pour, ice drop, smoke curl — slow and luxurious.'),

  // DELIVERED — a guest outside on the street, mid-laugh at golden hour.
  room1: live('room-1', R, 'The welcome', 'A guest on the street outside, mid-laugh — the evening beginning.', '/media/guest-portrait.jpg'),
  // DELIVERED — wine poured at the table over dinner, glasses catching the light.
  room2: live('room-2', R, 'The long table', 'Wine poured over dinner — the evening finding its center.', '/media/wine-pour-table.jpg'),
  // DELIVERED — friends toasting at the brick bar counter, beer and Aperol.
  room3: live('room-3', R, 'The bar', 'A toast at the counter — brick, brass and good company.', '/media/bar-cheers.jpg'),
  room4: slot('room-4', 'image', 4 / 5, 'The corner', 'The requested table.'),
  room5: slot('room-5', 'image', 1, 'The pass', 'Kitchen detail.'),
  // DELIVERED — the wine cabinet, a hand drawing a Blaufränkisch from the rack.
  room6: live('room-6', R, 'The cellar', 'The wine cabinet — a Blaufränkisch drawn from the rack.', '/media/wine-fridge-brueckner.jpg'),

  eventsRoom: slot('events-room', 'image', 16 / 9, 'Private room', 'The whole room dressed for a celebration.'),
} as const

export type MediaKey = keyof typeof media
