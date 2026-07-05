import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { VideoSlot } from './film'

/**
 * A human-action moment. When the clip is delivered (`slot.src`) it plays a
 * seamless, muted, looping video texture on a softly-framed plane, keyed into
 * the scene so it sits in the world rather than on top of it. Until then it
 * renders a premium placeholder — a dark, brass-framed panel with a slow inner
 * glow, so the film is fully blocked-out and the real clip drops straight in.
 *
 * No faces are ever the point; these are gestures — hands, steam, a shake.
 */
export function VideoMoment({
  slot,
  position,
  rotation = 0,
  scale = 1,
}: {
  slot: VideoSlot
  position: [number, number, number]
  rotation?: number
  scale?: number
}) {
  const [tex, setTex] = useState<THREE.VideoTexture | null>(null)
  const glow = useRef<THREE.Mesh>(null)
  const h = scale
  const w = scale * slot.ratio

  useEffect(() => {
    if (!slot.src) return
    const video = document.createElement('video')
    video.src = slot.src
    video.loop = true
    video.muted = true
    video.playsInline = true
    video.crossOrigin = 'anonymous'
    video.play().catch(() => {})
    const t = new THREE.VideoTexture(video)
    t.colorSpace = THREE.SRGBColorSpace
    setTex(t)
    return () => {
      video.pause()
      video.src = ''
      t.dispose()
    }
  }, [slot.src])

  const frameColor = useMemo(() => new THREE.Color('#8c6a3f'), [])

  useFrame((state) => {
    if (glow.current) {
      const m = glow.current.material as THREE.MeshBasicMaterial
      m.opacity = 0.12 + 0.08 * (0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 0.7))
    }
  })

  return (
    <group position={position} rotation-y={rotation}>
      {/* soft brass frame */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[w + 0.08, h + 0.08]} />
        <meshBasicMaterial color={frameColor} transparent opacity={0.5} />
      </mesh>

      {tex ? (
        <mesh>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      ) : (
        <>
          {/* placeholder screen: deep, quiet, waiting for footage */}
          <mesh>
            <planeGeometry args={[w, h]} />
            <meshBasicMaterial color={'#0d0a08'} />
          </mesh>
          <mesh ref={glow}>
            <planeGeometry args={[w * 0.9, h * 0.9]} />
            <meshBasicMaterial color={'#c9a96a'} transparent opacity={0.15} depthWrite={false} />
          </mesh>
        </>
      )}
    </group>
  )
}
