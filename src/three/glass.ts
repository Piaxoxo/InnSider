import * as THREE from 'three'

/**
 * Three glasses, one silhouette.
 *
 * Each glass is described by the same twelve key points of its profile — the
 * outline you would get by slicing it down the middle. Because the counts
 * match, any two can simply be blended point by point, and the lathe rebuilt:
 * the stem thins and grows as a wine glass becomes a coupe, then sinks into
 * the body as the coupe becomes a tumbler. It is one continuous object, never
 * a cut between three models.
 *
 * Points are [radius, height]. The key points are deliberately sparse; a
 * spline smooths them into the ~80 points the lathe actually uses, so the
 * silhouette stays soft at every step of the blend.
 */

export type Profile = [number, number][]

const wine: Profile = [
  [0.0, 0.0],
  [0.52, 0.0],
  [0.54, 0.035],
  [0.1, 0.1],
  [0.055, 0.22],
  [0.055, 0.85],
  [0.09, 0.96],
  [0.3, 1.06],
  [0.5, 1.26],
  [0.6, 1.56],
  [0.575, 1.82],
  [0.5, 2.0],
]

const coupe: Profile = [
  [0.0, 0.0],
  [0.52, 0.0],
  [0.54, 0.035],
  [0.1, 0.1],
  [0.055, 0.22],
  [0.055, 0.8],
  [0.1, 0.9],
  [0.35, 0.98],
  [0.62, 1.12],
  [0.75, 1.3],
  [0.78, 1.42],
  [0.78, 1.46],
]

const tumbler: Profile = [
  [0.0, 0.0],
  [0.62, 0.0],
  [0.64, 0.035],
  [0.64, 0.12],
  [0.635, 0.3],
  [0.63, 0.6],
  [0.633, 0.85],
  [0.64, 1.05],
  [0.65, 1.25],
  [0.66, 1.4],
  [0.665, 1.5],
  [0.665, 1.55],
]

/**
 * `floor` is the height of the inside bottom — where a pour would come to
 * rest. It cannot be read off the key points: in a stemmed glass that is the
 * base of the bowl, high above the foot, while in a tumbler it is barely above
 * the table. Getting this wrong leaves the drink floating at the rim.
 */
export const glasses: { name: string; profile: Profile; floor: number }[] = [
  { name: 'Weinglas', profile: wine, floor: 1.08 },
  { name: 'Coupe', profile: coupe, floor: 1.0 },
  { name: 'Tumbler', profile: tumbler, floor: 0.07 },
]

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * The profile at a point in the journey. `t` runs 0..1 across all three
 * glasses; between two of them the points are blended one to one.
 */
export function profileAt(t: number): Profile {
  const n = glasses.length - 1
  const pos = THREE.MathUtils.clamp(t, 0, 1) * n
  const i = Math.min(Math.floor(pos), n - 1)
  const f = THREE.MathUtils.smoothstep(pos - i, 0, 1)
  const a = glasses[i].profile
  const b = glasses[i + 1].profile
  return a.map((p, k) => [lerp(p[0], b[k][0], f), lerp(p[1], b[k][1], f)] as [number, number])
}

/** The inside bottom at a point in the journey, blended like the profile. */
export function floorAt(t: number): number {
  const n = glasses.length - 1
  const pos = THREE.MathUtils.clamp(t, 0, 1) * n
  const i = Math.min(Math.floor(pos), n - 1)
  const f = THREE.MathUtils.smoothstep(pos - i, 0, 1)
  return lerp(glasses[i].floor, glasses[i + 1].floor, f)
}

/** The name to print alongside — the nearer of the two glasses being blended. */
export function glassNameAt(t: number): string {
  const n = glasses.length - 1
  const pos = THREE.MathUtils.clamp(t, 0, 1) * n
  return glasses[Math.round(pos)].name
}

/**
 * Smooth the key points into a lathe-ready outline.
 *
 * Not with a spline. A Catmull-Rom curve overshoots wherever the key points
 * turn sharply and unevenly — and the sharpest turn in any of these glasses is
 * the right angle where the base meets the wall. The overshoot there bulged
 * into a flared foot and left a phantom waist above it, so the tumbler never
 * looked like a tumbler.
 *
 * Instead the outline is walked in even steps along the straight segments,
 * then relaxed a few times with a three-point average. Rounding a corner that
 * way can only ever cut it, never push past it.
 */
export function toLathePoints(profile: Profile, segments = 96): THREE.Vector2[] {
  const pts = profile.map(([r, y]) => new THREE.Vector2(r, y))

  // Walk the polyline at constant arc length.
  const seg: number[] = []
  let total = 0
  for (let i = 1; i < pts.length; i++) {
    const d = pts[i].distanceTo(pts[i - 1])
    seg.push(d)
    total += d
  }

  const out: THREE.Vector2[] = []
  for (let k = 0; k <= segments; k++) {
    let want = (k / segments) * total
    let i = 0
    while (i < seg.length - 1 && want > seg[i]) {
      want -= seg[i]
      i++
    }
    const f = seg[i] > 1e-6 ? want / seg[i] : 0
    out.push(pts[i].clone().lerp(pts[i + 1], Math.min(f, 1)))
  }

  // Relax the corners. Ends are pinned so the foot stays on the table and the
  // rim keeps its height.
  for (let pass = 0; pass < 6; pass++) {
    for (let i = 1; i < out.length - 1; i++) {
      out[i].x = (out[i - 1].x + out[i].x * 2 + out[i + 1].x) / 4
      out[i].y = (out[i - 1].y + out[i].y * 2 + out[i + 1].y) / 4
    }
  }
  for (const p of out) p.x = Math.max(p.x, 0)
  return out
}

/**
 * The outline of what is in the glass: the inner wall from the inside bottom up
 * to the fill line, closed with a disc at either end so it reads as a body of
 * liquid rather than a shell.
 *
 * The wall is taken from the glass's own outline rather than from the key
 * points, pulled in slightly — so the drink always hugs the shape it is in,
 * whatever the blend is doing at that moment.
 */
export function liquidPoints(
  profile: Profile,
  floorY: number,
  fill: number,
  segments = 140,
): THREE.Vector2[] {
  const outline = toLathePoints(profile, segments)
  const rim = outline[outline.length - 1].y
  if (rim <= floorY) return []

  const yFill = lerp(floorY, rim, THREE.MathUtils.clamp(fill, 0, 1))
  if (yFill - floorY < 0.02) return []

  const inner = outline
    .filter((p) => p.y >= floorY && p.y <= yFill)
    .map((p) => new THREE.Vector2(Math.max(p.x * 0.93, 0.01), p.y))
  if (inner.length < 2) return []

  // Flat bottom, flat top: the surface stays level however far it has risen.
  return [
    new THREE.Vector2(0, inner[0].y),
    ...inner,
    new THREE.Vector2(inner[inner.length - 1].x, yFill),
    new THREE.Vector2(0, yFill),
  ]
}

/**
 * The room the glass stands in, as a texture.
 *
 * Transmission needs something to refract: with an empty environment glass
 * renders as grey soup. Rather than download an HDRI, the room is painted —
 * a warm ceiling, a dark floor, and two bright vertical strips standing in for
 * the window and the candle. Those strips are what become the long highlights
 * running down the stem.
 */
export function makeRoomTexture(): THREE.Texture {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 256
  const g = c.getContext('2d')!

  const sky = g.createLinearGradient(0, 0, 0, 256)
  sky.addColorStop(0, '#d8b57a')
  sky.addColorStop(0.3, '#8a6c43')
  sky.addColorStop(0.55, '#3a2c1e')
  sky.addColorStop(0.75, '#170f0a')
  sky.addColorStop(1, '#0a0806')
  g.fillStyle = sky
  g.fillRect(0, 0, 512, 256)

  // The window: a tall, cool-warm panel.
  const win = g.createLinearGradient(0, 0, 0, 210)
  win.addColorStop(0, 'rgba(255, 249, 235, 1)')
  win.addColorStop(0.55, 'rgba(255, 226, 180, 0.7)')
  win.addColorStop(1, 'rgba(255, 210, 150, 0)')
  g.fillStyle = win
  g.fillRect(92, 0, 70, 205)

  // Eine zweite Lichtbahn gegenüber: so trägt das Glas bei jeder Drehung
  // mindestens ein Glanzlicht, statt einmal pro Umlauf stumpf zu werden.
  const win2 = g.createLinearGradient(0, 0, 0, 170)
  win2.addColorStop(0, 'rgba(255, 240, 214, 0.8)')
  win2.addColorStop(1, 'rgba(240, 200, 150, 0)')
  g.fillStyle = win2
  g.fillRect(404, 0, 44, 165)

  // The candle: smaller, hotter, further round the room.
  const flame = g.createRadialGradient(300, 92, 2, 300, 92, 78)
  flame.addColorStop(0, 'rgba(255, 244, 214, 1)')
  flame.addColorStop(0.28, 'rgba(240, 190, 118, 0.8)')
  flame.addColorStop(1, 'rgba(224, 164, 88, 0)')
  g.fillStyle = flame
  g.fillRect(212, 8, 176, 176)

  // A brass rail catching the light along the bar.
  const rail = g.createLinearGradient(0, 150, 512, 158)
  rail.addColorStop(0, 'rgba(201, 169, 106, 0)')
  rail.addColorStop(0.5, 'rgba(240, 214, 164, 0.85)')
  rail.addColorStop(1, 'rgba(201, 169, 106, 0)')
  g.fillStyle = rail
  g.fillRect(0, 150, 512, 8)

  const tex = new THREE.CanvasTexture(c)
  tex.mapping = THREE.EquirectangularReflectionMapping
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/**
 * The glass shader.
 *
 * MeshPhysicalMaterial's `transmission` needs a float render target and a
 * second pass of the whole scene. That is both expensive for one object and
 * silently unavailable on software renderers, where the glass comes out looking
 * like white ceramic. So the refraction is done here instead: the painted room
 * is sampled along the reflected and refracted directions, mixed by Fresnel.
 *
 * Doing it by hand buys something too. The refracted ray is traced three times
 * at slightly different indices — 1.50, 1.52, 1.54 — and the results taken as
 * red, green and blue. That is dispersion: the faint rainbow along a thick
 * edge, which is most of what tells the eye "this is glass" and which
 * `transmission` does not give you.
 */

export const glassVert = /* glsl */ `
  varying vec3 vWorld;
  varying vec3 vNormalW;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

export const glassFrag = /* glsl */ `
  precision highp float;

  uniform sampler2D uRoom;
  uniform vec3  uTint;        // what the body of the glass does to light
  uniform float uDensity;     // how much the tint accumulates
  uniform float uBase;        // opacity before Fresnel
  uniform float uEdge;        // how hard the rim lights up
  uniform float uIor;
  uniform float uSpread;      // distance between the three colour indices
  uniform vec3  uKey;         // direction of the practical light
  uniform float uExposure;    // the painted room is a picture, not a measurement

  varying vec3 vWorld;
  varying vec3 vNormalW;

  vec2 equirect(vec3 d) {
    return vec2(atan(d.z, d.x) * 0.1591549 + 0.5, asin(clamp(d.y, -1.0, 1.0)) * 0.3183099 + 0.5);
  }
  vec3 room(vec3 d) {
    // The room canvas is sRGB; this shader works in linear light.
    return pow(texture2D(uRoom, equirect(d)).rgb, vec3(2.2)) * uExposure;
  }

  void main() {
    vec3 N = normalize(vNormalW);
    vec3 I = normalize(vWorld - cameraPosition);
    // Lathes are one-sided; face the normal at the camera so back faces behave.
    if (dot(N, I) > 0.0) N = -N;

    vec3 R = reflect(I, N);
    vec3 reflected = room(R);

    // Dispersion: one ray per colour, a hair apart in index.
    float e = 1.0 / uIor;
    vec3 refracted = vec3(
      room(refract(I, N, e - uSpread)).r,
      room(refract(I, N, e)).g,
      room(refract(I, N, e + uSpread)).b
    );
    refracted *= mix(vec3(1.0), uTint, uDensity);

    // Schlick — glass is a mirror at grazing angles and a window head-on.
    float f = pow(1.0 - max(dot(-I, N), 0.0), 5.0);
    float fresnel = 0.04 + 0.96 * f;

    vec3 col = mix(refracted, reflected, fresnel);

    // The lit rim. Where the wall turns away from the eye the light travels
    // through the most glass, and that edge is what reads as "thick".
    col += vec3(1.0, 0.93, 0.8) * pow(f, 1.4) * 0.45;

    // The practical, caught as a hard streak down the stem.
    vec3 H = normalize(normalize(uKey) - I);
    col += vec3(1.0, 0.95, 0.86) * pow(max(dot(N, H), 0.0), 220.0) * 1.6;

    col = col / (col + vec3(0.85));

    float alpha = clamp(uBase + f * uEdge, 0.0, 1.0);
    gl_FragColor = vec4(col, alpha);
  }
`
