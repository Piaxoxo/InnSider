import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, DepthOfField, SMAA } from '@react-three/postprocessing'
import { Suspense } from 'react'
import * as THREE from 'three'
import { Film } from './Film'
import { MOMENTS } from './film'
import { navigate } from '../lib/useRoute'
import { initSmoothScroll, startScroll, ScrollTrigger } from '../lib/scroll'
import { useReducedMotion, isTouch } from '../lib/useReducedMotion'
import './stage3d.css'

/**
 * THE STAGE — the InnSider cinematic film.
 *
 * A fixed full-screen WebGL film the guest travels through; a tall invisible
 * scroll track drives the camera dolly (Lenis-synced). Rendering is tuned for
 * a sharp, premium look: device-pixel-ratio up to 2, SMAA edges, subtle bloom
 * and a *gentle* depth of field (the hero object stays crisp).
 *
 * A quality-control debug mode (press "d", or add `debug` to the hash) shows
 * FPS + DPR and toggles postprocessing (p), depth of field (o) and bloom (b) so
 * the cause of any softness can be isolated at a glance.
 */
export function StageSet() {
  const reduced = useReducedMotion()
  const touch = isTouch()

  const [debug, setDebug] = useState(() => typeof window !== 'undefined' && window.location.hash.includes('debug'))
  const [post, setPost] = useState(true)
  const [dof, setDof] = useState(!touch)
  const [bloom, setBloom] = useState(true)

  useEffect(() => {
    const teardown = initSmoothScroll()
    startScroll()
    requestAnimationFrame(() => ScrollTrigger.refresh())
    return teardown
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'd') setDebug((v) => !v)
      if (e.key === 'p') setPost((v) => !v)
      if (e.key === 'o') setDof((v) => !v)
      if (e.key === 'b') setBloom((v) => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const maxDpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2)

  return (
    <div className="stage3d">
      <div className="stage3d__canvas">
        <Canvas
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.14,
          }}
          dpr={[1, maxDpr]}
          camera={{ position: MOMENTS[0].cam, fov: 38, near: 0.05, far: 200 }}
          frameloop={reduced ? 'demand' : 'always'}
        >
          <Suspense fallback={null}>
            <Film reduced={reduced} lowPerf={touch} />
            {post && (
              <EffectComposer multisampling={0}>
                {bloom ? (
                  <Bloom mipmapBlur intensity={touch ? 0.5 : 0.6} luminanceThreshold={0.42} luminanceSmoothing={0.2} radius={0.68} />
                ) : (
                  <></>
                )}
                {/* Gentle cinematic focus — wide focal range keeps hero objects
                    sharp; only the far background softens. Full-res (no downsample). */}
                {dof && !touch ? (
                  <DepthOfField focusDistance={0.015} focalLength={0.09} bokehScale={1.4} />
                ) : (
                  <></>
                )}
                <SMAA />
                <Vignette offset={0.3} darkness={0.72} eskil={false} />
              </EffectComposer>
            )}
          </Suspense>
        </Canvas>
      </div>

      {/* Scroll track — invisible; its height is the length of the dolly. */}
      <div className="stage3d__track" aria-hidden="true" />

      <button className="stage3d__back" onClick={() => navigate('')} aria-label="Zurück">
        <span aria-hidden="true">←</span>
      </button>

      <div className="stage3d__cue" aria-hidden="true">
        <span className="stage3d__cue-line" />
      </div>

      <div className="stage3d__ambience" aria-hidden="true">
        <span className="stage3d__ambience-dot" />
        Ambiente · bald
      </div>

      {debug && (
        <DebugPanel dpr={maxDpr} post={post} dof={dof} bloom={bloom} />
      )}
    </div>
  )
}

/** QC overlay: live FPS + DPR + effect toggles. */
function DebugPanel({ dpr, post, dof, bloom }: { dpr: number; post: boolean; dof: boolean; bloom: boolean }) {
  const [fps, setFps] = useState(0)
  const frames = useRef(0)
  const last = useRef(performance.now())
  useEffect(() => {
    let raf = 0
    const loop = () => {
      frames.current++
      const now = performance.now()
      if (now - last.current >= 500) {
        setFps(Math.round((frames.current * 1000) / (now - last.current)))
        frames.current = 0
        last.current = now
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
  const row = (k: string, v: string) => (
    <div className="stage3d__dbg-row">
      <span>{k}</span>
      <span>{v}</span>
    </div>
  )
  return (
    <div className="stage3d__debug">
      {row('FPS', String(fps))}
      {row('DPR', `${(typeof window !== 'undefined' ? window.devicePixelRatio : 1).toFixed(2)} → ${dpr}`)}
      {row('post (p)', post ? 'on' : 'off')}
      {row('DOF (o)', dof ? 'on' : 'off')}
      {row('bloom (b)', bloom ? 'on' : 'off')}
      <div className="stage3d__dbg-hint">d: toggle · p/o/b: effects</div>
    </div>
  )
}
