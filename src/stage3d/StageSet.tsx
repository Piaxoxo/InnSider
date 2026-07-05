import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, SMAA } from '@react-three/postprocessing'
import { Suspense } from 'react'
import * as THREE from 'three'
import { Restaurant } from './Restaurant'
import { CAM_WAYPOINTS } from './stageData'
import { navigate } from '../lib/useRoute'
import { initSmoothScroll, startScroll, ScrollTrigger } from '../lib/scroll'
import { useReducedMotion, isTouch } from '../lib/useReducedMotion'
import './stage3d.css'

/**
 * THE STAGE — the InnSider film set.
 *
 * A fixed full-screen WebGL restaurant the guest travels through. A tall
 * invisible scroll track generates the scroll that drives the camera dolly
 * (Lenis-synced), so the whole thing is one continuous shot. No people, no
 * words, no sections — only the world, breathing through its light.
 */
export function StageSet() {
  const reduced = useReducedMotion()
  const touch = isTouch()

  // Boot smooth scroll so the camera dolly has a scroll signal to follow.
  useEffect(() => {
    const teardown = initSmoothScroll()
    startScroll()
    requestAnimationFrame(() => ScrollTrigger.refresh())
    return teardown
  }, [])

  return (
    <div className="stage3d">
      <div className="stage3d__canvas">
        <Canvas
          gl={{
            antialias: false,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.05,
          }}
          dpr={touch ? [1, 1.5] : [1, 1.9]}
          camera={{ position: CAM_WAYPOINTS[0], fov: 40, near: 0.1, far: 400 }}
          frameloop={reduced ? 'demand' : 'always'}
        >
          <Suspense fallback={null}>
            <Restaurant reduced={reduced} lowPerf={touch} />
            <EffectComposer multisampling={0}>
              <Bloom mipmapBlur intensity={touch ? 0.7 : 1.05} luminanceThreshold={0.18} luminanceSmoothing={0.3} radius={0.8} />
              <Vignette offset={0.28} darkness={0.82} eskil={false} />
              {touch ? <></> : <SMAA />}
            </EffectComposer>
          </Suspense>
        </Canvas>
      </div>

      {/* Scroll track — invisible; its height is the length of the dolly. */}
      <div className="stage3d__track" aria-hidden="true" />

      {/* Minimal chrome — no story, just a way back and a quiet cue. */}
      <button className="stage3d__back" onClick={() => navigate('')} aria-label="Zurück">
        <span aria-hidden="true">←</span>
      </button>

      <div className="stage3d__cue" aria-hidden="true">
        <span className="stage3d__cue-line" />
      </div>

      {/* Sound is a future phase — this is only a placeholder affordance. */}
      <div className="stage3d__ambience" aria-hidden="true">
        <span className="stage3d__ambience-dot" />
        Ambiente · bald
      </div>
    </div>
  )
}
