/**
 * The film set — data only.
 *
 * The InnSider dining room laid out as one connected environment the camera
 * travels through: entrance → seating → kitchen pass → bar → wine → windows →
 * private table. These are not "sections"; they are places in one room. Content
 * (Alice, Stefan, the menu) arrives in later phases and will hang off the
 * `anchors` below. Nothing here renders — it's the blueprint.
 */

/** Warm luxury palette — deep charcoal, walnut, brass, champagne, amber, ivory. */
export const PAL = {
  warmBlack: '#0a0806',
  charcoal: '#14110d',
  walnut: '#3a2418',
  walnutDark: '#241610',
  stone: '#6b6355',
  stoneDark: '#171310',
  brass: '#b8905a',
  gold: '#c9a96a',
  amber: '#e0a458',
  olive: '#6b6f4a',
  ivory: '#f2ece1',
  wine: '#5a2331',
} as const

/** Camera path — position waypoints (a slow dolly down the room centre). */
export const CAM_WAYPOINTS: [number, number, number][] = [
  [0, 1.62, 5],
  [0.7, 1.55, -18],
  [-0.7, 1.7, -46],
  [0.6, 1.5, -74],
  [-0.5, 1.66, -102],
  [0.35, 1.56, -128],
  [0, 1.5, -146],
]

/** Camera look-at waypoints (always gazing a little further into the room). */
export const LOOK_WAYPOINTS: [number, number, number][] = [
  [0, 1.42, -4],
  [-0.3, 1.4, -30],
  [0.4, 1.4, -58],
  [-0.3, 1.4, -86],
  [0.3, 1.4, -114],
  [0, 1.4, -138],
  [0, 1.28, -152],
]

export const ROOM = {
  width: 12, // x: -6 .. 6
  height: 6, // y: 0 .. 6
  zStart: 8, // entrance
  zEnd: -156, // back wall / doorway to future chapters
}

/** Table positions along the aisle (left/right, staggered rows). */
export const TABLES: { pos: [number, number, number]; rot: number }[] = [
  { pos: [-3.5, 0, -12], rot: 0.14 },
  { pos: [3.4, 0, -20], rot: -0.12 },
  { pos: [-3.6, 0, -30], rot: -0.1 },
  { pos: [3.5, 0, -40], rot: 0.12 },
  { pos: [-3.4, 0, -48], rot: 0.16 },
  { pos: [3.5, 0, -70], rot: -0.14 },
  { pos: [-3.6, 0, -78], rot: 0.1 },
  { pos: [-3.4, 0, -96], rot: -0.12 },
  { pos: [-3.6, 0, -118], rot: 0.12 },
]

/** Warm window panels down the left wall (exterior light spilling in). */
export const WINDOWS_Z = [-26, -46, -66, -86]

/** Pendant lamps down the ceiling centre. */
export const PENDANTS_Z = [-8, -24, -40, -56, -72, -88, -104, -120, -136]

/**
 * Visual anchor points for future phases — they already exist in the set, lit
 * and ready for their moment. Positions the camera will be able to push in on.
 */
export const ANCHORS = {
  doorway: { pos: [0, 1.4, 6] as const, note: 'Entrance — the threshold the guest crosses' },
  kitchenPass: { pos: [5.4, 1.4, -60] as const, note: "Open kitchen pass — Stefan's moment" },
  bar: { pos: [4.4, 1.2, -104] as const, note: 'Cocktail bar — the drinks come alive later' },
  wine: { pos: [-5.6, 1.6, -108] as const, note: 'Wine display — illuminated rack' },
  alicesTable: { pos: [0, 0.9, -140] as const, note: "The private table — Alice's story" },
  farDoor: { pos: [0, 1.6, -154] as const, note: 'Doorway leading toward future chapters' },
} as const

/**
 * SOUND SYSTEM PLACEHOLDER — no audio is implemented in this phase.
 * Each zone declares where an optional ambience loop will later play as the
 * camera passes through it. Wiring an audio engine to these is a future phase.
 */
export interface AmbienceZone {
  id: string
  z: number
  range: number
  clip: string | null // path to a future audio loop; null = not yet delivered
  label: string
}
export const AMBIENCE_ZONES: AmbienceZone[] = [
  { id: 'entrance', z: 2, range: 14, clip: null, label: 'Door, a little street' },
  { id: 'dining', z: -44, range: 40, clip: null, label: 'Low murmur, cutlery' },
  { id: 'kitchen', z: -60, range: 16, clip: null, label: 'Pass — sizzle, a call' },
  { id: 'bar', z: -104, range: 20, clip: null, label: 'Shaker, ice, glass' },
  { id: 'window', z: -66, range: 30, clip: null, label: 'Muffled outside' },
  { id: 'private', z: -140, range: 18, clip: null, label: 'Quiet, intimate' },
]
