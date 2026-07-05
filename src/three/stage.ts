import * as THREE from 'three'

/**
 * The cinematic stage — a single continuous camera move through the evening.
 *
 * Every chapter is a "scene" placed further down one long corridor in 3-D space.
 * Scroll drives a single camera along a Catmull-Rom spline through these
 * keyframes: it never cuts, it travels. Each scene carries its own light/fog
 * tint, so the camera flies through veils of coloured atmosphere as it moves
 * from the golden hero, through the warm kitchen, into the cool blue-hour bar
 * and home to the candlelit table.
 *
 * The readable content (text, menu, form) stays in the DOM, scrolling in front;
 * this is the depth-stage that travels behind it and gives the whole site the
 * feeling of one unbroken tracking shot.
 */

const rgb = (r: number, g: number, b: number): [number, number, number] => [r / 255, g / 255, b / 255]

export interface StageScene {
  id: string
  cam: [number, number, number]
  target: [number, number, number]
  /** the scene's atmospheric colour — the veil the camera passes through */
  fog: [number, number, number]
}

// Ordered to match the DOM chapter order. z marches steadily into the distance;
// small x/y offsets make the camera bank and drift so the travel reads as motion.
export const scenes: StageScene[] = [
  { id: 'hero', cam: [0, 0, 5], target: [0, 0, -3], fog: rgb(201, 169, 106) },
  { id: 'dream', cam: [-1.2, 0.4, -18], target: [0.5, 0.0, -26], fog: rgb(214, 184, 122) },
  { id: 'bridge', cam: [1.5, -0.3, -40], target: [-0.4, 0.0, -48], fog: rgb(196, 150, 120) },
  { id: 'kitchen', cam: [-1.7, 0.5, -62], target: [0.6, -0.2, -70], fog: rgb(233, 124, 52) },
  { id: 'menu', cam: [1.3, 0.2, -84], target: [-0.4, 0.0, -92], fog: rgb(206, 160, 96) },
  { id: 'bar', cam: [-1.9, -0.4, -106], target: [0.7, 0.2, -114], fog: rgb(120, 150, 190) },
  { id: 'evening', cam: [1.6, 0.6, -128], target: [-0.5, 0.0, -136], fog: rgb(118, 122, 168) },
  { id: 'gallery', cam: [-1.1, 0.2, -150], target: [0.4, 0.0, -158], fog: rgb(150, 150, 172) },
  { id: 'events', cam: [1.7, -0.2, -172], target: [-0.4, 0.1, -180], fog: rgb(214, 176, 112) },
  { id: 'reservation', cam: [0, 0.1, -194], target: [0, 0, -202], fog: rgb(214, 176, 122) },
]

export const camCurve = new THREE.CatmullRomCurve3(
  scenes.map((s) => new THREE.Vector3(...s.cam)),
  false,
  'catmullrom',
  0.5,
)
export const targetCurve = new THREE.CatmullRomCurve3(
  scenes.map((s) => new THREE.Vector3(...s.target)),
  false,
  'catmullrom',
  0.5,
)

export const CORRIDOR = { start: scenes[0].cam[2] + 1, end: scenes[scenes.length - 1].cam[2] - 12 }

const _a = new THREE.Color()
const _b = new THREE.Color()

/** The atmospheric tint at a normalized position t (0..1) along the corridor. */
export function sampleFog(t: number, out: THREE.Color): THREE.Color {
  const n = scenes.length
  const pos = THREE.MathUtils.clamp(t, 0, 1) * (n - 1)
  const i = Math.min(Math.floor(pos), n - 2)
  const f = pos - i
  _a.setRGB(...scenes[i].fog)
  _b.setRGB(...scenes[i + 1].fog)
  return out.copy(_a).lerp(_b, f)
}
