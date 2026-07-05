import { useEffect, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { VideoSlot } from './film'

/**
 * A human-action moment. When the clip is delivered (`slot.src`) it plays a
 * seamless, muted, looping video texture keyed into the scene. Until then it
 * renders a PREMIUM placeholder — a warm, out-of-focus restaurant (drifting
 * bokeh + grain + vignette) inside a soft brass frame, with a faint reflection
 * below. It reads as "a warm scene, slightly out of focus", never an empty box.
 */

const placeholderFrag = /* glsl */ `
  precision highp float;
  uniform float uTime;
  varying vec2 vUv;
  float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
  void main(){
    vec2 uv = vUv;
    vec3 col = vec3(0.03, 0.022, 0.014);
    // Soft warm bokeh lights drifting — an unfocused dining room.
    for (int i=0;i<6;i++){
      float fi=float(i);
      vec2 c = vec2(0.5 + 0.36*sin(uTime*0.09 + fi*1.7), 0.42 + 0.30*cos(uTime*0.07 + fi*2.3));
      float d = distance(uv, c);
      float b = smoothstep(0.34, 0.0, d);
      vec3 warm = mix(vec3(0.95,0.62,0.30), vec3(0.86,0.78,0.55), fract(fi*0.37));
      col += warm * b * b * 0.24;
    }
    // gentle horizontal light bar (a bar shelf, blurred)
    col += vec3(0.9,0.72,0.42) * smoothstep(0.14,0.0,abs(uv.y-0.66)) * 0.1;
    // vignette
    col *= smoothstep(1.15, 0.28, distance(uv, vec2(0.5,0.5)));
    // fine grain
    col += (hash(uv*vec2(900.0,520.0) + uTime) - 0.5) * 0.01;
    gl_FragColor = vec4(col, 1.0);
  }
`
const placeholderVert = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`

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
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])
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

  useFrame((_, delta) => {
    uniforms.uTime.value += delta
  })

  return (
    <group position={position} rotation-y={rotation}>
      {/* soft brass frame */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[w + 0.06, h + 0.06]} />
        <meshStandardMaterial color={'#b8905a'} metalness={0.9} roughness={0.28} emissive={'#4a3416'} emissiveIntensity={0.4} />
      </mesh>

      {tex ? (
        <mesh>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      ) : (
        <mesh>
          <planeGeometry args={[w, h]} />
          <shaderMaterial vertexShader={placeholderVert} fragmentShader={placeholderFrag} uniforms={uniforms} toneMapped={false} />
        </mesh>
      )}

      {/* faint reflection below (real footage only; the shader panel keeps clean) */}
      {tex && (
        <mesh position={[0, -h * 0.62, -0.01]} scale={[1, -0.4, 1]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={tex} transparent opacity={0.12} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
    </group>
  )
}
