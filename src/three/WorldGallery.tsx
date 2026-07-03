import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { pointer } from '../lib/pointer'

/**
 * 3-D scroll-world — the Location flythrough.
 *
 * The real photographs are convex shader slabs floating in depth; the camera
 * flies through them (scroll-driven, frame-independently damped) as each turns,
 * swells and ripples. It comes to rest on a full-bleed finale image that fills
 * the screen — a clean, deliberate ending rather than flying into the void.
 */

const BASE = import.meta.env.BASE_URL

type Shot = { url: string; x: number; y: number; portrait?: boolean }

const SHOTS: Shot[] = [
  { url: 'media/innsider-facade-guests.jpg', x: 0.1, y: 0.2 },
  { url: 'media/wine-pour-table.jpg', x: -2.7, y: -0.3 },
  { url: 'media/bar-counter-detail.jpg', x: 2.3, y: -0.2, portrait: true },
  { url: 'media/interior-nook-teal.jpg', x: -2.5, y: 0.5 },
  { url: 'media/bar-cheers.jpg', x: 2.7, y: 0.1 },
  { url: 'media/beer-taps.jpg', x: -2.6, y: -0.4 },
  { url: 'media/server-table.jpg', x: 2.4, y: 0.3, portrait: true },
  { url: 'media/wine-fridge-brueckner.jpg', x: -2.5, y: 0.2 },
  { url: 'media/guest-portrait.jpg', x: 2.6, y: -0.3 },
  { url: 'media/craft-salad-macro.jpg', x: -2.4, y: 0.4 },
  { url: 'media/dish-fish-risotto.jpg', x: 0.2, y: -0.1, portrait: true },
]

const GAP = 5.4
const total = SHOTS.length
const damp = THREE.MathUtils.damp

// Full-screen finale.
const FINALE_URL = 'media/interior-bar-wide.jpg'
const FINALE_H = 7
const FINALE_W = 12.6
const FINALE_Z = -total * GAP - 12

const photoVert = /* glsl */ `
  uniform float uTime, uNear;
  varying vec2 vUv;
  varying float vShade;
  void main() {
    vUv = uv;
    vec3 p = position;
    float cx = uv.x - 0.5;
    float cy = uv.y - 0.5;
    p.z += (cx * cx) * -1.35 + (cy * cy) * -0.7;
    p.z += sin(uv.x * 9.0 + uTime * 1.3) * 0.03 * uNear;
    p.z += cos(uv.y * 7.0 - uTime * 1.1) * 0.02 * uNear;
    vShade = 1.0 - (cx * cx + cy * cy) * 1.4;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`
const photoFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform float uOpacity, uNear;
  varying vec2 vUv;
  varying float vShade;
  void main() {
    vec3 c = texture2D(uTex, vUv).rgb;
    c *= mix(0.72, 1.12, clamp(vShade, 0.0, 1.0));
    c += vec3(0.05, 0.035, 0.015) * uNear;
    gl_FragColor = vec4(c, uOpacity);
  }
`

function Photo({ shot, index }: { shot: Shot; index: number }) {
  const mesh = useRef<THREE.Mesh>(null)
  const tex = useTexture(`${BASE}${shot.url}`)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4

  const z = -index * GAP
  const w = shot.portrait ? 2.2 : 3.5
  const h = shot.portrait ? 3.1 : 2.25
  const side = shot.x >= 0 ? -1 : 1

  const uniforms = useMemo(
    () => ({ uTex: { value: tex }, uTime: { value: 0 }, uNear: { value: 0 }, uOpacity: { value: 0 } }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useFrame((state, delta) => {
    const m = mesh.current
    if (!m) return
    const dt = Math.min(delta, 0.05)
    const signed = state.camera.position.z - z
    const near = Math.exp(-(signed * signed) / 18)
    const frontFade = THREE.MathUtils.clamp((16 - signed) / 8, 0, 1)
    const backFade = THREE.MathUtils.clamp((signed + 1.6) / 1.6, 0, 1)
    const opacity = frontFade * backFade

    uniforms.uTime.value += dt
    uniforms.uNear.value = damp(uniforms.uNear.value, near, 6, dt)
    uniforms.uOpacity.value = damp(uniforms.uOpacity.value, opacity, 8, dt)

    const targetRotY = side * (0.34 - signed * 0.03) + pointer.x * 0.1
    const targetRotX = -pointer.y * 0.05 + Math.sin(state.clock.elapsedTime * 0.3 + index) * 0.015
    m.rotation.y = damp(m.rotation.y, targetRotY, 5, dt)
    m.rotation.x = damp(m.rotation.x, targetRotX, 5, dt)
    m.scale.setScalar(damp(m.scale.x, 0.9 + near * 0.22, 6, dt))
    m.position.y = shot.y + Math.sin(state.clock.elapsedTime * 0.4 + index) * 0.06
  })

  return (
    <mesh ref={mesh} position={[shot.x, shot.y, z]}>
      <planeGeometry args={[w, h, 40, 28]} />
      <shaderMaterial vertexShader={photoVert} fragmentShader={photoFrag} uniforms={uniforms} transparent side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  )
}

const finaleFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    // cover-fit (plane 16:9, image 3:2 → crop top/bottom)
    vec2 uv = vUv;
    uv.y = (uv.y - 0.5) * (1.5 / 1.8) + 0.5;
    vec3 c = texture2D(uTex, uv).rgb;
    float vig = smoothstep(1.15, 0.35, length(vUv - 0.5));
    c *= mix(0.72, 1.0, vig);
    gl_FragColor = vec4(c, uOpacity);
  }
`

function Finale() {
  const mesh = useRef<THREE.Mesh>(null)
  const tex = useTexture(`${BASE}${FINALE_URL}`)
  tex.colorSpace = THREE.SRGBColorSpace
  const uniforms = useMemo(() => ({ uTex: { value: tex }, uOpacity: { value: 0 } }), [tex])
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const dist = state.camera.position.z - FINALE_Z
    const target = THREE.MathUtils.clamp((22 - dist) / 12, 0, 1)
    uniforms.uOpacity.value = damp(uniforms.uOpacity.value, target, 6, dt)
  })
  return (
    <mesh ref={mesh} position={[0, 0, FINALE_Z]}>
      <planeGeometry args={[FINALE_W, FINALE_H]} />
      <shaderMaterial fragmentShader={finaleFrag} uniforms={uniforms} vertexShader={finaleVert} transparent depthWrite={false} />
    </mesh>
  )
}
const finaleVert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`

function Rig({ progressRef }: { progressRef: { v: number } }) {
  const { camera } = useThree()
  const smooth = useRef(0)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    smooth.current = damp(smooth.current, progressRef.v, 6, dt)
    // End resting in front of the finale so it fills the screen.
    const fov = ((camera as THREE.PerspectiveCamera).fov * Math.PI) / 180
    const stopD = (FINALE_H / 2) / Math.tan(fov / 2) * 0.94
    const endZ = FINALE_Z + stopD
    const targetZ = 6 + smooth.current * (endZ - 6)
    camera.position.z = damp(camera.position.z, targetZ, 5, dt)
    camera.position.x = damp(camera.position.x, pointer.x * 0.7, 3.5, dt)
    camera.position.y = damp(camera.position.y, pointer.y * 0.45, 3.5, dt)
    camera.lookAt(0, 0, camera.position.z - 6)
  })
  return null
}

export function WorldGallery({ progressRef }: { progressRef: { v: number } }) {
  const shots = useMemo(() => SHOTS, [])
  return (
    <Canvas
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 6], fov: 46 }}
    >
      <Suspense fallback={null}>
        <Rig progressRef={progressRef} />
        {shots.map((s, i) => (
          <Photo key={s.url} shot={s} index={i} />
        ))}
        <Finale />
      </Suspense>
    </Canvas>
  )
}
