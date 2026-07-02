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

// Ordered to match nav / chapter scroll order.
export const grades: Grade[] = [
  // 01 Hero — candlelit golden hour
  { base: rgb(14, 11, 9), glow: rgb(201, 169, 106), accent: rgb(120, 78, 40) },
  // 02 Dream — warm stone, daylight memory of the sketch
  { base: rgb(20, 17, 13), glow: rgb(214, 184, 122), accent: rgb(150, 110, 70) },
  // 03 Kitchen — fire & heat
  { base: rgb(18, 12, 9), glow: rgb(224, 128, 60), accent: rgb(150, 60, 30) },
  // 04 Menu — deep dinner amber
  { base: rgb(16, 12, 9), glow: rgb(206, 160, 96), accent: rgb(110, 74, 42) },
  // 05 Bar — dark, brass on black
  { base: rgb(9, 8, 8), glow: rgb(196, 156, 92), accent: rgb(70, 52, 30) },
  // 06 Evening — night deepening, blue creeping in
  { base: rgb(9, 10, 14), glow: rgb(170, 140, 96), accent: rgb(46, 52, 74) },
  // 07 Gallery — cool museum light
  { base: rgb(13, 13, 15), glow: rgb(184, 168, 132), accent: rgb(60, 62, 72) },
  // 08 Events — warm celebration returns
  { base: rgb(16, 12, 10), glow: rgb(214, 176, 112), accent: rgb(120, 80, 46) },
  // 09 Reservation — the warm invitation, candle close
  { base: rgb(13, 10, 8), glow: rgb(212, 175, 122), accent: rgb(130, 88, 48) },
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
