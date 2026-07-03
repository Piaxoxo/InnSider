import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '../lib/scroll'
import { pointer } from '../lib/pointer'

/**
 * The hero's particle heart — a morphing form.
 *
 * At the top of the page the points describe a martini glass. As the guest
 * scrolls, the particles burst apart and re-assemble into a wine bottle, then
 * disperse and fade as the hero leaves. Two target point-clouds (martini,
 * bottle) are generated procedurally and mixed in the vertex shader, with an
 * outward scatter that peaks mid-morph for the "spring apart" moment. Additive
 * + bloom turns the silhouette into glowing embers.
 */
export function HeroOrb({ count = 8000, reduced }: { count?: number; reduced: boolean }) {
  const points = useRef<THREE.Points>(null)

  const { martini, bottle, scatter, seeds } = useMemo(() => {
    const martini = new Float32Array(count * 3)
    const bottle = new Float32Array(count * 3)
    const scatter = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    const TAU = Math.PI * 2
    for (let i = 0; i < count; i++) {
      const f = i / count
      const r1 = rand(i, 1)
      const r2 = rand(i, 2)
      const th = r2 * TAU

      // ── Martini glass ──
      let mx = 0, my = 0, mrad = 0
      if (f < 0.55) {
        // bowl — inverted cone (tip at 0, rim at top)
        const t = Math.sqrt(r1)
        mrad = t * 0.95
        my = t * 0.95
      } else if (f < 0.7) {
        // stem
        mrad = 0.035
        my = -r1 * 0.75
      } else {
        // base disk
        mrad = Math.sqrt(r1) * 0.55
        my = -0.78
      }
      mx = Math.cos(th) * mrad
      const mz = Math.sin(th) * mrad
      martini[i * 3] = mx * 1.45
      martini[i * 3 + 1] = (my - 0.12) * 1.45
      martini[i * 3 + 2] = mz * 1.45

      // ── Wine bottle ──
      let by = 0, brad = 0
      if (f < 0.5) {
        by = -1.0 + r1 * 1.4 // body
        brad = 0.5
      } else if (f < 0.68) {
        by = 0.4 + r1 * 0.5 // shoulder taper
        brad = 0.5 + (0.15 - 0.5) * ((by - 0.4) / 0.5)
      } else if (f < 0.82) {
        by = 0.9 + r1 * 0.4 // neck
        brad = 0.14
      } else if (f < 0.88) {
        by = 1.3 + r1 * 0.06 // cap
        brad = 0.16
      } else {
        by = -1.0 // base disk
        brad = Math.sqrt(r1) * 0.5
      }
      bottle[i * 3] = Math.cos(th) * brad * 1.05
      bottle[i * 3 + 1] = (by - 0.15) * 1.05
      bottle[i * 3 + 2] = Math.sin(th) * brad * 1.05

      // ── Scatter direction for the burst ──
      const sdx = rand(i, 4) * 2 - 1
      const sdy = rand(i, 5) * 2 - 1
      const sdz = rand(i, 6) * 2 - 1
      const len = Math.hypot(sdx, sdy, sdz) || 1
      scatter[i * 3] = sdx / len
      scatter[i * 3 + 1] = sdy / len
      scatter[i * 3 + 2] = sdz / len
      seeds[i] = rand(i, 7)
    }
    return { martini, bottle, scatter, seeds }
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uAlpha: { value: 1 },
      uPointer: { value: new THREE.Vector2() },
      uReduced: { value: reduced ? 1 : 0 },
      uSize: { value: Math.min(window.devicePixelRatio, 2) * 26 },
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
    // Martini (top) → bottle over the first sliver of scroll, then fade.
    u.uMorph.value = THREE.MathUtils.smoothstep(s, 0.0, 0.06)
    u.uAlpha.value = 1 - THREE.MathUtils.smoothstep(s, 0.07, 0.13)
    u.uPointer.value.set(pointer.x, pointer.y)
    u.uReduced.value = reduced ? 1 : 0
  })

  return (
    <points ref={points} position={[0, 0, 0]} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[martini, 3]} />
        <bufferAttribute attach="attributes-aBottle" args={[bottle, 3]} />
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
  attribute vec3 aBottle;
  attribute vec3 aScatter;
  attribute float aSeed;
  uniform float uTime, uMorph, uSize, uReduced;
  uniform vec2 uPointer;
  varying float vSeed;

  void main() {
    vSeed = aSeed;
    float t = uTime * 0.3;

    // Mix the two silhouettes; burst outward at the midpoint.
    vec3 pos = mix(position, aBottle, uMorph);
    float burst = sin(uMorph * 3.14159);
    pos += aScatter * burst * (1.4 + aSeed * 1.2);

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
