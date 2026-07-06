import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '../lib/scroll'
import { pointer } from '../lib/pointer'

/**
 * The hero's particle heart — a morphing form.
 *
 * At the top of the page the points describe a martini glass. As the guest
 * scrolls the whole evening, the particles burst apart and re-assemble through a
 * sequence of vessels — martini → wine bottle → champagne flute → coupe →
 * highball — one glass forming out of the last. All silhouettes are generated
 * procedurally; the two neighbouring shapes are mixed on the GPU (from → to)
 * with an outward scatter that peaks mid-morph for the "spring apart" moment.
 * Additive + bloom turns the silhouette into glowing embers. It's bold in the
 * hero and settles to a faint motif behind the content so text stays readable.
 */

const SHAPES = 5

function fillShapes(count: number) {
  // One Float32Array per silhouette, plus scatter directions + seeds.
  const arr = Array.from({ length: SHAPES }, () => new Float32Array(count * 3))
  const scatter = new Float32Array(count * 3)
  const seeds = new Float32Array(count)
  const TAU = Math.PI * 2

  for (let i = 0; i < count; i++) {
    const f = i / count
    const r1 = rand(i, 1)
    const th = rand(i, 2) * TAU
    const cos = Math.cos(th)
    const sin = Math.sin(th)
    const put = (s: number, x: number, y: number, z: number) => {
      arr[s][i * 3] = x
      arr[s][i * 3 + 1] = y
      arr[s][i * 3 + 2] = z
    }

    // 0 ── Martini ──
    {
      let rad = 0, y = 0
      if (f < 0.55) { const t = Math.sqrt(r1); rad = t * 0.95; y = t * 0.95 }
      else if (f < 0.7) { rad = 0.035; y = -r1 * 0.75 }
      else { rad = Math.sqrt(r1) * 0.55; y = -0.78 }
      put(0, cos * rad * 1.45, (y - 0.12) * 1.45, sin * rad * 1.45)
    }

    // 1 ── Wine bottle ──
    {
      let rad = 0, y = 0
      if (f < 0.5) { y = -1.0 + r1 * 1.4; rad = 0.5 }
      else if (f < 0.68) { y = 0.4 + r1 * 0.5; rad = 0.5 + (0.15 - 0.5) * ((y - 0.4) / 0.5) }
      else if (f < 0.82) { y = 0.9 + r1 * 0.4; rad = 0.14 }
      else if (f < 0.88) { y = 1.3 + r1 * 0.06; rad = 0.16 }
      else { y = -1.0; rad = Math.sqrt(r1) * 0.5 }
      put(1, cos * rad * 1.05, (y - 0.15) * 1.05, sin * rad * 1.05)
    }

    // 2 ── Champagne flute (tall, narrow) ──
    {
      let rad = 0, y = 0
      if (f < 0.72) { y = -0.1 + r1 * 1.35; rad = 0.1 + 0.06 * ((y + 0.1) / 1.35) }
      else if (f < 0.86) { rad = 0.03; y = -r1 * 0.6 - 0.1 }
      else { rad = Math.sqrt(r1) * 0.4; y = -0.72 }
      put(2, cos * rad * 1.3, (y - 0.1) * 1.3, sin * rad * 1.3)
    }

    // 3 ── Coupe (wide, shallow) ──
    {
      let rad = 0, y = 0
      if (f < 0.6) { const t = Math.sqrt(r1); rad = t * 1.0; y = 0.12 + t * t * 0.2 }
      else if (f < 0.76) { rad = 0.03; y = -r1 * 0.7 + 0.05 }
      else { rad = Math.sqrt(r1) * 0.5; y = -0.72 }
      put(3, cos * rad * 1.12, (y - 0.05) * 1.12, sin * rad * 1.12)
    }

    // 4 ── Highball (tall tumbler) ──
    {
      let rad = 0, y = 0
      if (f < 0.86) { rad = 0.5; y = -0.9 + r1 * 1.8 }
      else { rad = Math.sqrt(r1) * 0.5; y = -0.9 }
      put(4, cos * rad, y, sin * rad)
    }

    // Scatter direction for the burst.
    const sdx = rand(i, 4) * 2 - 1
    const sdy = rand(i, 5) * 2 - 1
    const sdz = rand(i, 6) * 2 - 1
    const len = Math.hypot(sdx, sdy, sdz) || 1
    scatter[i * 3] = sdx / len
    scatter[i * 3 + 1] = sdy / len
    scatter[i * 3 + 2] = sdz / len
    seeds[i] = rand(i, 7)
  }
  return { arr, scatter, seeds }
}

export function HeroOrb({ count = 12000, reduced }: { count?: number; reduced: boolean }) {
  const points = useRef<THREE.Points>(null)
  const fromAttr = useRef<THREE.BufferAttribute>(null)
  const toAttr = useRef<THREE.BufferAttribute>(null)
  const segRef = useRef(-1)

  const { shapes, fromArr, toArr, scatter, seeds } = useMemo(() => {
    const { arr, scatter, seeds } = fillShapes(count)
    // Mutable from/to buffers, seeded with the first two shapes.
    const fromArr = arr[0].slice()
    const toArr = arr[1].slice()
    return { shapes: arr, fromArr, toArr, scatter, seeds }
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uAlpha: { value: 0.85 },
      uPointer: { value: new THREE.Vector2() },
      uReduced: { value: reduced ? 1 : 0 },
      uSize: { value: Math.min(window.devicePixelRatio, 2) * 24 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useFrame((_, delta) => {
    const p = points.current
    if (!p) return
    const u = (p.material as THREE.ShaderMaterial).uniforms
    const s = THREE.MathUtils.clamp(scrollState.progress, 0, 1)
    u.uTime.value += delta * (reduced ? 0 : 1)

    // Walk the shape sequence across the whole scroll; swap the from/to buffers
    // only when we cross into a new segment (cheap), mix them on the GPU.
    const ph = s * (SHAPES - 1)
    const seg = Math.min(Math.floor(ph), SHAPES - 2)
    const frac = ph - seg
    if (seg !== segRef.current) {
      segRef.current = seg
      fromArr.set(shapes[seg])
      toArr.set(shapes[seg + 1])
      if (fromAttr.current) fromAttr.current.needsUpdate = true
      if (toAttr.current) toAttr.current.needsUpdate = true
    }
    u.uMorph.value = frac
    // Bold in the hero, then a faint background motif so content stays readable.
    u.uAlpha.value = THREE.MathUtils.lerp(0.85, 0.32, THREE.MathUtils.smoothstep(s, 0.02, 0.14))
    u.uPointer.value.set(pointer.x, pointer.y)
    u.uReduced.value = reduced ? 1 : 0
  })

  return (
    <points ref={points} position={[0, 0, 0]} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute ref={fromAttr} attach="attributes-position" args={[fromArr, 3]} />
        <bufferAttribute ref={toAttr} attach="attributes-aTo" args={[toArr, 3]} />
        <bufferAttribute attach="attributes-aScatter" args={[scatter, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={orbVert}
        fragmentShader={orbFrag}
      />
    </points>
  )
}

function rand(i: number, salt: number) {
  const x = Math.sin(i * 92.17 + salt * 411.3) * 43758.5453
  return x - Math.floor(x)
}

const orbVert = /* glsl */ `
  attribute vec3 aTo;
  attribute vec3 aScatter;
  attribute float aSeed;
  uniform float uTime, uMorph, uSize, uReduced;
  uniform vec2 uPointer;
  varying float vSeed;

  void main() {
    vSeed = aSeed;
    float t = uTime * 0.3;

    // Mix the two neighbouring silhouettes; burst outward at the midpoint.
    vec3 pos = mix(position, aTo, uMorph);
    float burst = sin(uMorph * 3.14159);
    pos += aScatter * burst * (1.3 + aSeed * 1.1);

    // Gentle breathing shimmer.
    pos += aScatter * sin(t * 1.5 + aSeed * 6.28) * 0.03 * (1.0 - uReduced);

    // Slow spin + pointer lean.
    float ang = t * 0.16 + uPointer.x * 0.5;
    mat2 rot = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
    pos.xz = rot * pos.xz;
    pos.y += uPointer.y * 0.3;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.35 + aSeed) * (1.0 / -mv.z);
  }
`

const orbFrag = /* glsl */ `
  precision highp float;
  uniform float uAlpha;
  varying float vSeed;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float a = smoothstep(0.5, 0.0, d);
    a *= (0.15 + 0.6 * vSeed) * uAlpha;
    vec3 warm = mix(vec3(0.82, 0.62, 0.32), vec3(0.95, 0.85, 0.62), vSeed);
    gl_FragColor = vec4(warm, a);
  }
`
