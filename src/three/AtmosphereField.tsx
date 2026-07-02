import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { atmosphereVert, atmosphereFrag } from './atmosphereShader'
import { grades } from '../content/palette'
import { scrollState } from '../lib/scroll'
import { pointer, easePointer } from '../lib/pointer'

/**
 * The fullscreen atmosphere plane. Renders in clip space (vertex shader
 * bypasses the camera) so it always fills the viewport. Each frame it lerps
 * the palette from the current chapter's grade toward the next based on
 * overall scroll progress, then feeds base/glow/accent to the shader.
 */
export function AtmosphereField({ reduced }: { reduced: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const { size, viewport } = useThree()

  // Scratch vectors reused every frame (no per-frame allocation).
  const tmp = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3() }), [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uReduced: { value: reduced ? 1 : 0 },
      uBase: { value: new THREE.Vector3(...grades[0].base) },
      uGlow: { value: new THREE.Vector3(...grades[0].glow) },
      uAccent: { value: new THREE.Vector3(...grades[0].accent) },
    }),
    // size/reduced handled in useFrame; init once
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useFrame((_, delta) => {
    const m = mat.current
    if (!m) return
    const u = m.uniforms

    u.uTime.value += delta
    u.uResolution.value.set(size.width * viewport.dpr, size.height * viewport.dpr)
    u.uReduced.value = reduced ? 1 : 0

    if (!reduced) {
      easePointer(0.05)
      u.uPointer.value.set(pointer.x, pointer.y)
    } else {
      u.uPointer.value.set(0, 0)
    }

    // Map global progress across the grade stops and lerp between neighbours.
    const n = grades.length
    const pos = THREE.MathUtils.clamp(scrollState.progress, 0, 1) * (n - 1)
    const i = Math.min(Math.floor(pos), n - 2)
    const f = pos - i
    const a = grades[i]
    const b = grades[i + 1]

    u.uBase.value.copy(tmp.a.set(...a.base).lerp(tmp.b.set(...b.base), f))
    u.uGlow.value.copy(tmp.a.set(...a.glow).lerp(tmp.b.set(...b.glow), f))
    u.uAccent.value.copy(tmp.a.set(...a.accent).lerp(tmp.b.set(...b.accent), f))
  })

  return (
    <mesh frustumCulled={false}>
      {/* Fullscreen triangle covering clip space. */}
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3]}
        />
        <bufferAttribute attach="attributes-uv" args={[new Float32Array([0, 0, 2, 0, 0, 2]), 2]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        vertexShader={atmosphereVert}
        fragmentShader={atmosphereFrag}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}
