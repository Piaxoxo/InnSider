import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { AtmosphereField } from './AtmosphereField'
import { DustField } from './DustField'
import { useReducedMotion, isTouch } from '../lib/useReducedMotion'
import './atmosphere.css'

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
          <AtmosphereField reduced={reduced} />
          <DustField count={dust} reduced={reduced} />
        </Suspense>
      </Canvas>
    </div>
  )
}
