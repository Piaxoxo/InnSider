import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshReflectorMaterial, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { PAL } from './stageData'
import { COUNTER } from './film'

const rand = (i: number, s: number) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453
  return x - Math.floor(x)
}

export function softTexture(): THREE.Texture {
  const c = document.createElement('canvas')
  c.width = c.height = 96
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(48, 48, 0, 48, 48, 48)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.5, 'rgba(255,255,255,0.4)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 96, 96)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/* Crystal — real refraction on desktop, a clean tinted glass on low-power. */
function Crystal({ lowPerf }: { lowPerf: boolean }) {
  if (lowPerf) {
    return <meshPhysicalMaterial color={'#eef1f4'} transparent opacity={0.22} roughness={0.08} metalness={0} />
  }
  return (
    <meshPhysicalMaterial
      color={'#ffffff'}
      transmission={1}
      thickness={0.4}
      roughness={0.05}
      ior={1.46}
      transparent
      opacity={1}
      metalness={0}
      clearcoat={1}
      clearcoatRoughness={0.06}
    />
  )
}

/* ── The reflective marble counter that carries the whole film ───────────── */
export function Counter({ lowPerf }: { lowPerf: boolean }) {
  const midZ = (COUNTER.from + COUNTER.to) / 2
  const len = COUNTER.from - COUNTER.to + 8
  return (
    <group>
      {/* body */}
      <mesh position={[0, COUNTER.top - 0.45, midZ]}>
        <boxGeometry args={[2.6, 0.9, len]} />
        <meshStandardMaterial color={PAL.stoneDark} roughness={0.4} metalness={0.2} />
      </mesh>
      {/* polished marble top with real-time reflections */}
      <mesh rotation-x={-Math.PI / 2} position={[0, COUNTER.top, midZ]}>
        <planeGeometry args={[2.6, len]} />
        <MeshReflectorMaterial
          resolution={lowPerf ? 128 : 512}
          mirror={0.5}
          blur={[400, 120]}
          mixBlur={1.1}
          mixStrength={2}
          roughness={0.55}
          depthScale={0.8}
          color={'#20211f'}
          metalness={0.4}
        />
      </mesh>
      {/* a brass rail catches the warm light down the front edge */}
      <mesh position={[0, COUNTER.top - 0.03, midZ + 0]}>
        <boxGeometry args={[2.62, 0.02, len]} />
        <meshStandardMaterial color={PAL.brass} metalness={0.9} roughness={0.3} emissive={PAL.amber} emissiveIntensity={0.12} />
      </mesh>
    </group>
  )
}

/* ── Candle — the film's little flame, flickering as a real light ────────── */
export function Candle({ position, tex, seed = 0.3 }: { position: [number, number, number]; tex: THREE.Texture; seed?: number }) {
  const flame = useRef<THREE.Mesh>(null)
  const light = useRef<THREE.PointLight>(null)
  useFrame((s) => {
    const t = s.clock.elapsedTime
    const f = 0.8 + 0.2 * Math.sin(t * 11 + seed * 6.2) + 0.08 * Math.sin(t * 23 + seed)
    if (flame.current) {
      ;(flame.current.material as THREE.MeshBasicMaterial).opacity = 0.75 * f
      flame.current.scale.set(0.05 + 0.012 * f, 0.09 + 0.02 * f, 1)
    }
    if (light.current) light.current.intensity = 1.7 * f
  })
  return (
    <group position={position}>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.018, 0.02, 0.1, 10]} />
        <meshStandardMaterial color={PAL.ivory} roughness={0.5} emissive={PAL.amber} emissiveIntensity={0.15} />
      </mesh>
      <Billboard position={[0, 0.15, 0]}>
        <mesh ref={flame}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={tex} color={PAL.amber} transparent opacity={0.75} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      </Billboard>
      <pointLight ref={light} position={[0, 0.16, 0]} color={PAL.amber} intensity={1.7} distance={2.2} decay={2} />
    </group>
  )
}

/* ── A glass of red wine, catching the light ─────────────────────────────── */
export function WineGlass({ position, lowPerf, wine = PAL.wine }: { position: [number, number, number]; lowPerf: boolean; wine?: string }) {
  const liq = useRef<THREE.Mesh>(null)
  useFrame((s) => {
    if (liq.current) {
      const m = liq.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = 0.14 + 0.06 * Math.sin(s.clock.elapsedTime * 1.4)
    }
  })
  return (
    <group position={position}>
      <mesh position={[0, 0.003, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.006, 24]} />
        <Crystal lowPerf={lowPerf} />
      </mesh>
      <mesh position={[0, 0.075, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.14, 12]} />
        <Crystal lowPerf={lowPerf} />
      </mesh>
      <mesh position={[0, 0.21, 0]}>
        <cylinderGeometry args={[0.058, 0.022, 0.15, 28, 1, true]} />
        <Crystal lowPerf={lowPerf} />
      </mesh>
      <mesh ref={liq} position={[0, 0.185, 0]}>
        <cylinderGeometry args={[0.05, 0.02, 0.09, 24]} />
        <meshStandardMaterial color={wine} roughness={0.15} metalness={0.05} emissive={wine} emissiveIntensity={0.16} transparent opacity={0.94} />
      </mesh>
    </group>
  )
}

/* ── Two glasses meeting — a quiet clink ─────────────────────────────────── */
export function Clink({ position, tex, lowPerf }: { position: [number, number, number]; tex: THREE.Texture; lowPerf: boolean }) {
  const group = useRef<THREE.Group>(null)
  useFrame((s) => {
    if (group.current) {
      // they drift almost together, then rest — a breath apart.
      const d = 0.02 + 0.02 * (0.5 + 0.5 * Math.sin(s.clock.elapsedTime * 0.5))
      group.current.children[0].position.x = -0.12 - d
      group.current.children[1].position.x = 0.12 + d
    }
  })
  return (
    <group position={position}>
      <group ref={group}>
        <group>
          <WineGlass position={[-0.14, 0, 0]} lowPerf={lowPerf} />
        </group>
        <group>
          <WineGlass position={[0.14, 0, 0]} lowPerf={lowPerf} />
        </group>
      </group>
      <Candle position={[0, 0, 0.16]} tex={tex} seed={0.7} />
    </group>
  )
}

/* ── A signature cocktail: ice, garnish, a straw that trembles ───────────── */
export function Cocktail({ position, lowPerf }: { position: [number, number, number]; lowPerf: boolean }) {
  const ice = useRef<THREE.Group>(null)
  const straw = useRef<THREE.Mesh>(null)
  useFrame((s) => {
    const t = s.clock.elapsedTime
    if (ice.current) ice.current.rotation.y = t * 0.15
    if (straw.current) straw.current.rotation.z = Math.sin(t * 14) * 0.02
  })
  return (
    <group position={position}>
      {/* rocks glass */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.06, 0.052, 0.12, 28, 1, true]} />
        <Crystal lowPerf={lowPerf} />
      </mesh>
      <mesh position={[0, 0.004, 0]}>
        <cylinderGeometry args={[0.052, 0.052, 0.008, 28]} />
        <Crystal lowPerf={lowPerf} />
      </mesh>
      {/* liquid */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.055, 0.05, 0.08, 24]} />
        <meshStandardMaterial color={PAL.amber} roughness={0.1} emissive={PAL.amber} emissiveIntensity={0.3} transparent opacity={0.85} />
      </mesh>
      {/* ice */}
      <group ref={ice} position={[0, 0.07, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[(rand(i, 1) - 0.5) * 0.05, (rand(i, 2) - 0.5) * 0.03, (rand(i, 3) - 0.5) * 0.05]} rotation={[rand(i, 4) * 3, rand(i, 5) * 3, 0]}>
            <boxGeometry args={[0.026, 0.026, 0.026]} />
            <meshPhysicalMaterial color={'#eaf2f5'} transparent opacity={0.5} roughness={0.1} transmission={lowPerf ? 0 : 0.8} thickness={0.1} />
          </mesh>
        ))}
      </group>
      {/* orange-peel garnish */}
      <mesh position={[0.02, 0.13, 0]} rotation={[0.4, 0, 0.6]}>
        <torusGeometry args={[0.018, 0.006, 8, 16]} />
        <meshStandardMaterial color={PAL.amber} roughness={0.5} emissive={PAL.amber} emissiveIntensity={0.15} />
      </mesh>
      {/* straw */}
      <mesh ref={straw} position={[0.02, 0.12, 0.01]} rotation-z={0.25}>
        <cylinderGeometry args={[0.003, 0.003, 0.16, 6]} />
        <meshStandardMaterial color={PAL.gold} metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

/* ── The shaker — polished metal catching warm reflections ───────────────── */
export function Shaker({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.11, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.22, 28]} />
        <meshStandardMaterial color={'#cdb488'} metalness={0.95} roughness={0.16} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.055, 0.05, 0.07, 28]} />
        <meshStandardMaterial color={'#d8c199'} metalness={0.95} roughness={0.14} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.03, 0.055, 0.03, 28]} />
        <meshStandardMaterial color={'#e0cba6'} metalness={0.95} roughness={0.12} />
      </mesh>
    </group>
  )
}

/* ── The pour — a glass and a thin ribbon of liquid, in slow motion ──────── */
export function Pour({ position, lowPerf }: { position: [number, number, number]; lowPerf: boolean }) {
  const stream = useRef<THREE.Mesh>(null)
  useFrame((s) => {
    if (stream.current) {
      const m = stream.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = 0.4 + 0.2 * Math.sin(s.clock.elapsedTime * 6)
    }
  })
  return (
    <group position={position}>
      <Cocktail position={[0, 0, 0]} lowPerf={lowPerf} />
      {/* falling ribbon */}
      <mesh ref={stream} position={[0.0, 0.28, 0]}>
        <cylinderGeometry args={[0.006, 0.008, 0.34, 8]} />
        <meshStandardMaterial color={PAL.amber} roughness={0.05} emissive={PAL.amber} emissiveIntensity={0.45} transparent opacity={0.85} />
      </mesh>
    </group>
  )
}

/* ── Two finished plates with rising steam — the pass ────────────────────── */
export function Plates({ position, tex }: { position: [number, number, number]; tex: THREE.Texture }) {
  const steam = useRef<THREE.Points>(null)
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const n = 26
    const p = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      p[i * 3] = (rand(i, 1) - 0.5) * 0.4
      p[i * 3 + 1] = rand(i, 2) * 0.5
      p[i * 3 + 2] = (rand(i, 3) - 0.5) * 0.4
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3))
    return g
  }, [])
  useFrame((s) => {
    if (steam.current) steam.current.position.y = 0.16 + Math.sin(s.clock.elapsedTime * 0.4) * 0.02
  })
  return (
    <group position={position}>
      {[-0.2, 0.2].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh position={[0, 0.01, 0]}>
            <cylinderGeometry args={[0.16, 0.15, 0.014, 40]} />
            <meshStandardMaterial color={PAL.ivory} roughness={0.35} metalness={0.05} />
          </mesh>
          <mesh position={[0, 0.03, 0]}>
            <sphereGeometry args={[0.05, 16, 12]} />
            <meshStandardMaterial color={PAL.olive} roughness={0.6} />
          </mesh>
          <mesh position={[0.03, 0.045, 0.02]}>
            <sphereGeometry args={[0.02, 10, 8]} />
            <meshStandardMaterial color={PAL.wine} roughness={0.5} />
          </mesh>
        </group>
      ))}
      <points ref={steam} geometry={geo} position={[0, 0.16, 0]}>
        <pointsMaterial size={0.16} map={tex} color={PAL.ivory} transparent opacity={0.08} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>
      <pointLight position={[0, 0.4, 0]} color={PAL.amber} intensity={2.4} distance={2.4} decay={2} />
    </group>
  )
}
