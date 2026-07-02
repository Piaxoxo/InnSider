import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense } from 'react'
import * as THREE from 'three'
import { AtmosphereField } from './AtmosphereField'
import { DustField } from './DustField'
import { useReducedMotion, isTouch } from '../lib/useReducedMotion'
import { scrollState } from '../lib/scroll'
import { pointer } from '../lib/pointer'
import './atmosphere.css'

/**
 * Eases the camera through the dust volume: it dollies in and descends as the
 * guest scrolls the night, and drifts with the pointer — giving the ambient
 * particles genuine 3-D parallax behind the content. The fullscreen light
 * shader is camera-independent, so only the depth layers respond.
 */
function CameraRig({ reduced }: { reduced: boolean }) {
  const { camera } = useThree()
  useFrame(() => {
    if (reduced) return
    const s = THREE.MathUtils.clamp(scrollState.progress, 0, 1)
    const tx = pointer.x * 0.35
    const ty = pointer.y * 0.22 - s * 0.6
    const tz = 5 - s * 1.1
    camera.position.x += (tx - camera.position.x) * 0.04
    camera.position.y += (ty - camera.position.y) * 0.04
    camera.position.z += (tz - camera.position.z) * 0.04
    camera.lookAt(0, 0, -1)
  })
  return null
}

/**
 * The persistent cinematic environment. One fixed WebGL canvas behind the
 * entire site: a fullscreen light/fog shader that re-grades per chapter, plus
 * drifting dust motes. Everything else scrolls over it, so the "room" is always
 * alive and the lighting changes as the evening unfolds.
 *
 * Kept deliberately to a single WebGL context for a stable 60fps; heavier 3D is
 * reserved for the hero accent layer.
 */
export function Atmosphere() {
  const reduced = useReducedMotion()
  const touch = isTouch()
  // Fewer motes on touch/low-power; none of it is load-bearing for content.
  const dust = touch ? 160 : 320

  return (
    <div className="atmosphere" aria-hidden="true">
      <Canvas
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 50 }}
        frameloop={reduced ? 'demand' : 'always'}
      >
        <Suspense fallback={null}>
          <CameraRig reduced={reduced} />
          <AtmosphereField reduced={reduced} />
          <DustField count={dust} reduced={reduced} />
        </Suspense>
      </Canvas>
    </div>
  )
}
