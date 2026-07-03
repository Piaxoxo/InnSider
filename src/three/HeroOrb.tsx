import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '../lib/scroll'
import { pointer } from '../lib/pointer'

/**
 * The heart of the world — a GPU particle orb.
 *
 * Thousands of points seeded on a sphere, displaced every frame by a cheap
 * curl-like turbulence in the vertex shader: it breathes, rotates, and leans
 * toward the pointer. As the guest scrolls out of the hero the particles
 * disperse outward and fade, so entering the site feels like flying through it.
 * Additive + warm gold; the bloom pass turns it into glowing embers.
 */
export function HeroOrb({ count = 9000, reduced }: { count?: number; reduced: boolean }) {
  const points = useRef<THREE.Points>(null)

  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    // Fibonacci sphere for an even shell.
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const theta = golden * i
      const rad = 1.5 + rand(i, 7) * 0.35
      positions[i * 3] = Math.cos(theta) * r * rad
      positions[i * 3 + 1] = y * rad
      positions[i * 3 + 2] = Math.sin(theta) * r * rad
      seeds[i] = rand(i, 3)
    }
    return { positions, seeds }
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
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
    u.uTime.value += delta * (reduced ? 0 : 1)
    u.uScroll.value = THREE.MathUtils.clamp(scrollState.progress, 0, 1)
    u.uPointer.value.set(pointer.x, pointer.y)
    u.uReduced.value = reduced ? 1 : 0
  })

  return (
    <points ref={points} position={[0, 0, 0]} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
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
  attribute float aSeed;
  uniform float uTime, uScroll, uSize, uReduced;
  uniform vec2 uPointer;
  varying float vSeed;
  varying float vAlpha;

  vec3 curl(vec3 p, float t) {
    return vec3(
      sin(p.y * 1.5 + t) + cos(p.z * 1.2 - t * 0.7),
      sin(p.z * 1.4 - t * 0.8) + cos(p.x * 1.1 + t * 0.6),
      sin(p.x * 1.3 + t * 0.9) + cos(p.y * 1.0 - t * 0.5)
    );
  }

  void main() {
    vSeed = aSeed;
    vec3 pos = position;
    float t = uTime * 0.3;

    // Turbulent swirl + gentle breathing.
    vec3 c = curl(pos * 1.15 + aSeed * 3.0, t);
    pos += c * (0.10 + 0.16 * aSeed) * (1.0 - uReduced * 0.85);
    pos *= 1.0 + 0.05 * sin(t + aSeed * 6.28) * (1.0 - uReduced);

    // Disperse outward + collapse as the hero scrolls away.
    pos += normalize(position) * uScroll * (1.6 + aSeed * 3.2);

    // Slow rotation + pointer lean.
    float ang = t * 0.14 + uPointer.x * 0.45;
    mat2 rot = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
    pos.xz = rot * pos.xz;
    pos.y += uPointer.y * 0.3;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.35 + aSeed) * (1.0 / -mv.z);

    // Bright through the hero, dispersed and gone shortly after.
    vAlpha = (1.0 - smoothstep(0.02, 0.09, uScroll));
  }
`

const orbFrag = /* glsl */ `
  precision highp float;
  varying float vSeed;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float a = smoothstep(0.5, 0.0, d);
    a *= (0.15 + 0.6 * vSeed) * vAlpha;
    vec3 warm = mix(vec3(0.82, 0.62, 0.32), vec3(0.95, 0.85, 0.62), vSeed);
    gl_FragColor = vec4(warm, a);
  }
`
