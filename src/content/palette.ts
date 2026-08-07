/**
 * The evening's color grade.
 *
 * A single fixed WebGL canvas sits behind the whole site and morphs its palette
 * as you scroll — golden hour → dinner → deep wine → the dark of the bar → the
 * blue-black of late night → the warm return of the reservation. This is the
 * cinematic through-line: the lighting genuinely changes as the night unfolds,
 * done in one cheap fragment shader rather than nine heavy 3D scenes.
 *
 * Each stop maps to a chapter (by scroll order). Colors are linear-ish RGB in
 * 0..1 for direct use as shader uniforms.
 */

export interface Grade {
  /** deep background wash */
  base: [number, number, number]
  /** warm light source / glow */
  glow: [number, number, number]
  /** secondary accent used in the drifting fog */
  accent: [number, number, number]
}

const rgb = (r: number, g: number, b: number): [number, number, number] => [r / 255, g / 255, b / 255]

/**
 * Ordered to match nav / chapter scroll order.
 *
 * All stops are held to a common, low luminance band so the room never washes
 * out under the text — each chapter keeps its hue identity (kitchen fire, bar
 * blue hour, the warm return) but none of them out-brightens the others. Text
 * legibility is a design constraint here, not an afterthought.
 */
export const grades: Grade[] = [
  // 01 Hero — candlelit golden hour
  { base: rgb(12, 10, 8), glow: rgb(168, 140, 88), accent: rgb(92, 60, 30) },
  // 02 Dream — warm stone, daylight memory of the sketch
  { base: rgb(14, 12, 9), glow: rgb(176, 150, 100), accent: rgb(104, 76, 48) },
  // 03 Kitchen — fire & heat
  { base: rgb(15, 10, 7), glow: rgb(196, 104, 44), accent: rgb(120, 46, 20) },
  // 04 Menu — deep dinner amber
  { base: rgb(12, 10, 8), glow: rgb(170, 132, 80), accent: rgb(84, 56, 32) },
  // 05 Bar — blue hour: the room cools, gold drinks against blue
  { base: rgb(8, 10, 15), glow: rgb(118, 132, 158), accent: rgb(36, 48, 74) },
  // 06 Evening — night deepening, blue creeping in
  { base: rgb(8, 9, 13), glow: rgb(132, 110, 76), accent: rgb(38, 44, 62) },
  // 07 Gallery — cool museum light
  { base: rgb(11, 11, 13), glow: rgb(140, 128, 102), accent: rgb(48, 50, 60) },
  // 08 Events — warm celebration returns
  { base: rgb(13, 10, 8), glow: rgb(178, 146, 92), accent: rgb(96, 64, 38) },
  // 09 Reservation — the warm invitation, candle close
  { base: rgb(11, 9, 7), glow: rgb(176, 144, 100), accent: rgb(104, 70, 38) },
]

/** Static brand tokens (kept in sync with CSS custom properties in tokens.css). */
export const tokens = {
  warmWhite: '#f2ece1',
  stone: '#b8ad9c',
  black: '#0a0908',
  charcoal: '#17140f',
  gold: '#c9a96a',
  goldBright: '#d9bd86',
  bronze: '#8c6a3f',
  amber: '#e0a458',
  olive: '#6b6f4a',
} as const
