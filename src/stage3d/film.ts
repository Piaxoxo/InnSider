/**
 * Phase 2.5 — the directed film.
 *
 * Not a page. A continuous luxury restaurant film controlled by scrolling. The
 * camera glides through a sequence of intimate close-up "moments" on a long
 * marble counter — a glass of wine, a signature cocktail, a quiet clink, the
 * shaker, the pour, the pass — and finally rises to reveal the room alive.
 *
 * Division of labour (per the brief): Three.js renders the OBJECTS (glasses,
 * cocktails, shaker, plates, reflections, steam, lighting, the camera). The
 * HUMAN actions (a waiter pouring, a bartender's hands, Chef Stefan plating, a
 * couple reaching for each other) are looping VIDEO clips dropped into the slots
 * below — they arrive later, exactly like the photo slots. Until then each slot
 * renders a premium placeholder panel, so the film is fully blocked-out.
 *
 * Transitions are physical: the camera follows the objects and the focus pulls
 * from subject to subject. Nothing transitions "because the user scrolled" —
 * scroll only moves the camera; the world does the rest.
 */

/** A looping cinematic clip of a human action. `src` null until footage lands. */
export interface VideoSlot {
  id: string
  note: string // art-direction brief for the clip
  src: string | null // '/media/film/xxx.mp4' when delivered
  ratio: number // w/h, reserves the panel
}

const clip = (id: string, note: string, ratio = 16 / 9): VideoSlot => ({ id, note, src: null, ratio })

export const VIDEO_SLOTS: Record<string, VideoSlot> = {
  waiterPour: clip('waiter-pour', 'A waiter gently pours red wine into a crystal glass — hands only, warm candlelight, shallow focus.', 4 / 5),
  bartenderPlace: clip('bartender-place', "A bartender's hand sets a signature cocktail on marble — condensation, a slow release.", 4 / 5),
  coupleHands: clip('couple-hands', 'Two hands meet across the table; no faces, only the gesture. Candlelight.'),
  bartenderShake: clip('bartender-shake', 'One smooth, confident cocktail shake — polished metal catching warm light.', 4 / 5),
  chefPlating: clip('chef-plating', 'Chef Stefan flips a pan, a small flame, then plates two dishes. Calm, precise.'),
  roomReveal: clip('room-reveal', 'The room opens up — warm light, people, atmosphere. InnSider alive.', 21 / 9),
}

export type PropType = 'wine' | 'cocktail' | 'clink' | 'shaker' | 'pour' | 'plates' | 'none'

export interface Moment {
  id: string
  cam: [number, number, number]
  look: [number, number, number]
  prop: PropType
  propPos: [number, number, number]
  /** which human-action clip plays at this moment, and where its panel hangs */
  video?: { slot: keyof typeof VIDEO_SLOTS; pos: [number, number, number]; rot?: number; scale?: number }
}

// The counter runs down -z at y≈0.9. The camera trails each hero object closely,
// a hair above tabletop, then rises at the end to reveal the room.
export const MOMENTS: Moment[] = [
  {
    id: 'first-glass',
    cam: [0.6, 1.18, 0.6],
    look: [0, 1.0, -1.8],
    prop: 'wine',
    propPos: [0, 0.9, -1.8],
    video: { slot: 'waiterPour', pos: [-1.5, 1.25, -2.6], rot: 0.5, scale: 1.7 },
  },
  {
    id: 'cocktail',
    cam: [-0.55, 1.14, -5.4],
    look: [0.15, 1.0, -8],
    prop: 'cocktail',
    propPos: [0.15, 0.9, -8],
    video: { slot: 'bartenderPlace', pos: [1.6, 1.3, -8.8], rot: -0.5, scale: 1.7 },
  },
  {
    id: 'moment',
    cam: [0.45, 1.16, -11.6],
    look: [0, 1.0, -14],
    prop: 'clink',
    propPos: [0, 0.9, -14],
    video: { slot: 'coupleHands', pos: [0, 1.5, -15.4], rot: 0, scale: 2.4 },
  },
  {
    id: 'bar',
    cam: [-0.5, 1.34, -17.4],
    look: [-0.2, 1.12, -20],
    prop: 'shaker',
    propPos: [-0.2, 0.98, -20],
    video: { slot: 'bartenderShake', pos: [1.5, 1.45, -20.8], rot: -0.5, scale: 1.8 },
  },
  {
    id: 'pour',
    cam: [0.55, 1.12, -23.4],
    look: [0.1, 1.0, -26],
    prop: 'pour',
    propPos: [0.1, 0.9, -26],
  },
  {
    id: 'kitchen',
    cam: [-0.35, 1.28, -30],
    look: [0, 1.02, -33],
    prop: 'plates',
    propPos: [0, 0.9, -33],
    video: { slot: 'chefPlating', pos: [0, 1.7, -35], rot: 0, scale: 3.2 },
  },
  {
    id: 'reveal',
    cam: [0, 1.55, -38.5],
    look: [0, 1.9, -50],
    prop: 'none',
    propPos: [0, 0, -50],
    video: { slot: 'roomReveal', pos: [0, 2.2, -52], rot: 0, scale: 7 },
  },
]

export const COUNTER = { x: 0, top: 0.9, from: 3, to: -40 }
