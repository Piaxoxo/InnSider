import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Image } from '@react-three/drei'
import * as THREE from 'three'
import { pointer } from '../lib/pointer'

/**
 * Stage 1 of the full 3-D scroll-world: a flythrough gallery.
 *
 * The guest's real photographs float as planes staggered in depth along -Z.
 * As the section scrolls, the camera flies forward through them — past,
 * between and beyond the images — while each plane drifts and leans with the
 * pointer. This is the "own world" the site is being rebuilt toward, applied
 * first to the Location chapter.
 *
 * `progress` (0..1) is the section's scroll progress, fed from the DOM so it
 * stays in sync with the rest of the Lenis-driven page.
 */

const BASE = import.meta.env.BASE_URL

type Shot = { url: string; x: number; y: number; portrait?: boolean }

// Real interior / atmosphere photos, arranged left/right down the corridor.
const SHOTS: Shot[] = [
  { url: 'media/innsider-facade-guests.jpg', x: 0, y: 0.2 },
  { url: 'media/interior-bar-wide.jpg', x: 2.4, y: 0.4 },
  { url: 'media/wine-pour-table.jpg', x: -2.6, y: -0.3 },
  { url: 'media/bar-counter-detail.jpg', x: 2.2, y: -0.2, portrait: true },
  { url: 'media/interior-nook-teal.jpg', x: -2.3, y: 0.5 },
  { url: 'media/bar-cheers.jpg', x: 2.6, y: 0.1 },
  { url: 'media/beer-taps.jpg', x: -2.5, y: -0.4 },
  { url: 'media/server-table.jpg', x: 2.3, y: 0.3, portrait: true },
  { url: 'media/wine-fridge-brueckner.jpg', x: -2.4, y: 0.2 },
  { url: 'media/guest-portrait.jpg', x: 2.5, y: -0.3 },
  { url: 'media/craft-salad-macro.jpg', x: -2.2, y: 0.4 },
  { url: 'media/dish-fish-risotto.jpg', x: 0.2, y: -0.2, portrait: true },
]

const GAP = 5.2 // z-distance between shots
const total = SHOTS.length

function Plane({ shot, index }: { shot: Shot; index: number }) {
  const ref = useRef<THREE.Group>(null)
  const z = -index * GAP
  const w = shot.portrait ? 2.1 : 3.4
  const h = shot.portrait ? 3.0 : 2.2

  useFrame((state) => {
    const g = ref.current
    if (!g) return
    const t = state.clock.elapsedTime
    // gentle float + pointer lean
    g.position.y = shot.y + Math.sin(t * 0.4 + index) * 0.08
    g.rotation.y = pointer.x * 0.12 + (shot.x > 0 ? -0.18 : 0.18)
    g.rotation.x = -pointer.y * 0.06
  })

  return (
    <group ref={ref} position={[shot.x, shot.y, z]}>
      <Image url={`${BASE}${shot.url}`} scale={[w, h]} transparent />
    </group>
  )
}

function Rig({ progressRef }: { progressRef: { v: number } }) {
  const { camera } = useThree()
  useFrame(() => {
    const end = -(total - 1) * GAP
    const targetZ = 6 + progressRef.v * (end - 8)
    camera.position.z += (targetZ - camera.position.z) * 0.08
    camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.04
    camera.position.y += (pointer.y * 0.4 - camera.position.y) * 0.04
    camera.lookAt(0, 0, camera.position.z - 6)
  })
  return null
}

export function WorldGallery({ progressRef }: { progressRef: { v: number } }) {
  const shots = useMemo(() => SHOTS, [])
  return (
    <Canvas
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 6], fov: 48 }}
    >
      <Suspense fallback={null}>
        <Rig progressRef={progressRef} />
        {shots.map((s, i) => (
          <Plane key={s.url} shot={s} index={i} />
        ))}
      </Suspense>
    </Canvas>
  )
}
