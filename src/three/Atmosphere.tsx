import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { Suspense } from 'react'
import { AtmosphereField } from './AtmosphereField'
import { DustField } from './DustField'
import { HeroOrb } from './HeroOrb'
import { StageRig, StageVeils, StageDepth } from './StageWorld'
import { useReducedMotion, isTouch } from '../lib/useReducedMotion'
import './atmosphere.css'

/**
 * The persistent cinematic stage. One fixed WebGL canvas behind the entire site.
 *
 * A single scroll-driven camera travels continuously down a 3-D corridor of
 * scenes (StageRig) — it never cuts, it tracks. Along the way it flies through
 * veils of coloured atmosphere (StageVeils), each tinted with its chapter's key,
 * while a long volume of motes streams past for parallax (StageDepth). A
 * fullscreen light/fog shader (AtmosphereField, camera-independent) re-grades
 * per chapter as the ambient base, and the hero keeps its morphing particle orb.
 *
 * The readable content scrolls in the DOM in front of all this, so the site is
 * one unbroken tracking shot with real depth — not a stack of sections.
 */
export function Atmosphere({ showOrb = true }: { showOrb?: boolean }) {
  const reduced = useReducedMotion()
  const touch = isTouch()
  // Scale the world down on touch/low-power; none of it is load-bearing.
  const dust = touch ? 150 : 340
  const orb = touch ? 6000 : 16000
  const veils = touch ? 10 : 16
  const depth = touch ? 240 : 520

  return (
    <div className="atmosphere" aria-hidden="true">
      <Canvas
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        dpr={touch ? [1, 1.5] : [1, 1.75]}
        camera={{ position: [0, 0, 5], fov: 50, near: 0.1, far: 340 }}
        frameloop={reduced ? 'demand' : 'always'}
      >
        <Suspense fallback={null}>
          <StageRig reduced={reduced} />
          <AtmosphereField reduced={reduced} />
          {/* The orb is a scroll-driven motion accent; under reduced motion the
              demand frameloop never runs its fade, so it would freeze on screen.
              Skip it there — the atmosphere + candle glow carry the hero. */}
          {showOrb && !reduced && <HeroOrb count={orb} reduced={reduced} />}
          <DustField count={dust} reduced={reduced} />
          {!reduced && <StageDepth count={depth} />}
          <StageVeils count={veils} />
          {/* Bloom turns the light, dust, veils and orb into glowing embers —
              the single biggest lift toward a "webgl world" look. */}
          <EffectComposer multisampling={0}>
            <Bloom mipmapBlur intensity={touch ? 0.5 : 0.85} luminanceThreshold={0.5} luminanceSmoothing={0.25} radius={0.75} />
            <Vignette offset={0.2} darkness={0.88} eskil={false} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  )
}
