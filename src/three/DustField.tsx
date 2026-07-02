import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { pointer } from '../lib/pointer'
import { scrollState } from '../lib/scroll'

/**
 * Ambient dust motes drifting in the light — the fine particulate that sells
 * "candlelit room" more than anything. Additive, warm, GPU-cheap points that
 * rise slowly, twinkle, and parallax gently with the pointer.
 */
export function DustField({ count = 320, reduced }: { count?: number; reduced: boolean }) {
  const points = useRef<THREE.Points>(null)

  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (rand(i, 1) * 2 - 1) * 7
      positions[i * 3 + 1] = (rand(i, 2) * 2 - 1) * 4.5
      // Wider depth spread → stronger parallax under the camera rig.
      positions[i * 3 + 2] = rand(i, 3) * -7.5 - 0.8
      seeds[i] = rand(i, 4)
    }
    return { positions, seeds }
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
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
    u.uTime.value += delta * (reduced ? 0.15 : 1)
    u.uPointer.value.set(pointer.x, pointer.y)
    u.uReduced.value = reduced ? 1 : 0
    // Motes thin out as the night deepens (scroll progresses).
    p.position.y = scrollState.progress * 1.2
    ;(p.material as THREE.ShaderMaterial).opacity = 1
  })

  return (
    <points ref={points} position={[0, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-seed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={dustVert}
        fragmentShader={dustFrag}
      />
    </points>
  )
}

// Deterministic pseudo-random so SSR/reload are stable (Math.random-free init).
function rand(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

const dustVert = /* glsl */ `
  attribute float seed;
  uniform float uTime;
  uniform float uSize;
  uniform vec2  uPointer;
  uniform float uReduced;
  varying float vSeed;
  varying float vTwinkle;

  void main() {
    vSeed = seed;
    vec3 pos = position;

    float t = uTime;
    // Slow rise + lateral sway; wraps within a band.
    pos.y += mod(t * (0.08 + seed * 0.12) + seed * 10.0, 8.0) - 4.0;
    pos.x += sin(t * (0.2 + seed) + seed * 6.28) * 0.3;

    // Pointer parallax by depth.
    float depth = (pos.z + 5.0) / 5.0;
    pos.x += uPointer.x * depth * 0.4;
    pos.y += uPointer.y * depth * 0.25;

    vTwinkle = 0.5 + 0.5 * sin(t * (1.0 + seed * 2.0) + seed * 30.0);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.3 + seed) * (1.0 / -mv.z);
  }
`

const dustFrag = /* glsl */ `
  precision highp float;
  varying float vSeed;
  varying float vTwinkle;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float alpha = smoothstep(0.5, 0.0, d);
    alpha *= 0.12 + 0.5 * vTwinkle;
    // Warm brass tint, slightly varied per mote.
    vec3 col = mix(vec3(0.79, 0.66, 0.42), vec3(0.88, 0.78, 0.6), vSeed);
    gl_FragColor = vec4(col, alpha);
  }
`
