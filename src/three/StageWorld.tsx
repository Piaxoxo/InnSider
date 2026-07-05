import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '../lib/scroll'
import { pointer } from '../lib/pointer'
import { scenes, camCurve, targetCurve, sampleFog, CORRIDOR } from './stage'

const damp = THREE.MathUtils.damp

/**
 * The camera. Reads global scroll (Lenis-synced) and travels continuously along
 * the scene spline — position and look-at both interpolated, so it banks and
 * turns through the corridor and never cuts. Pointer adds a little handheld
 * drift. Scroll IS the camera control.
 */
export function StageRig({ reduced }: { reduced: boolean }) {
  const { camera } = useThree()
  const t = useRef(0)
  const pos = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const s = THREE.MathUtils.clamp(scrollState.progress, 0, 1)
    // Damp the spline parameter, not the position — keeps speed even through turns.
    t.current = damp(t.current, s, 4, dt)
    camCurve.getPoint(t.current, pos)
    targetCurve.getPoint(t.current, look)
    if (!reduced) {
      pos.x += pointer.x * 0.6
      pos.y += pointer.y * 0.4
    }
    camera.position.copy(pos)
    camera.lookAt(look)
  })
  return null
}

// Shared soft radial sprite — the veils and motes read as light, not hard discs.
function makeSoftTexture(): THREE.Texture {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.55, 'rgba(255,255,255,0.42)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

const rand = (i: number, s: number) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453
  return x - Math.floor(x)
}

function Veil({ z, x, y, color, tex }: { z: number; x: number; y: number; color: THREE.Color; tex: THREE.Texture }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    const m = ref.current
    if (!m) return
    // Wash peaks as the camera reaches the veil, then clears once it's passed.
    const d = state.camera.position.z - z
    const a = Math.exp(-(d * d) / 260) * 0.5
    const mat = m.material as THREE.MeshBasicMaterial
    mat.opacity = a
    m.visible = a > 0.004
    m.lookAt(state.camera.position)
  })
  return (
    <mesh ref={ref} position={[x, y, z]}>
      <planeGeometry args={[90, 60]} />
      <meshBasicMaterial
        color={color}
        map={tex}
        transparent
        opacity={0}
        depthWrite={false}
        depthTest={false}
        side={THREE.DoubleSide}
        blending={THREE.NormalBlending}
      />
    </mesh>
  )
}

/**
 * Veils of coloured atmosphere strung along the corridor. Each is tinted by the
 * scene it belongs to; the camera flies through them, so the world washes into
 * each chapter's key — the visible "transition" between scenes.
 */
export function StageVeils({ count = 16 }: { count?: number }) {
  const tex = useMemo(makeSoftTexture, [])
  const veils = useMemo(() => {
    const out: { z: number; x: number; y: number; color: THREE.Color }[] = []
    for (let k = 0; k < count; k++) {
      const t = k / (count - 1)
      const z = THREE.MathUtils.lerp(CORRIDOR.start, CORRIDOR.end, t)
      out.push({
        z,
        x: (rand(k, 1) - 0.5) * 6,
        y: (rand(k, 2) - 0.5) * 4,
        color: sampleFog(t, new THREE.Color()),
      })
    }
    return out
  }, [count])
  return (
    <group renderOrder={-1}>
      {veils.map((v, i) => (
        <Veil key={i} z={v.z} x={v.x} y={v.y} color={v.color} tex={tex} />
      ))}
    </group>
  )
}

/**
 * A long volume of faint motes spanning the whole corridor. As the camera
 * travels they stream past — the parallax that sells continuous motion through
 * real depth rather than a colour crossfade.
 */
export function StageDepth({ count = 520 }: { count?: number }) {
  const tex = useMemo(makeSoftTexture, [])
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (rand(i, 1) * 2 - 1) * 34
      positions[i * 3 + 1] = (rand(i, 2) * 2 - 1) * 22
      positions[i * 3 + 2] = CORRIDOR.start - rand(i, 3) * (CORRIDOR.start - CORRIDOR.end)
    }
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [count])
  const color = useMemo(() => new THREE.Color(0.85, 0.72, 0.5), [])
  return (
    <points geometry={geo}>
      <pointsMaterial
        size={0.7}
        map={tex}
        color={color}
        transparent
        opacity={0.5}
        depthWrite={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// keep scenes import referenced for tree-shaking clarity
void scenes
