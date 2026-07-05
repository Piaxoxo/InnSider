import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MeshReflectorMaterial, Environment, Lightformer, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { scrollState } from '../lib/scroll'
import { pointer } from '../lib/pointer'
import {
  PAL,
  ROOM,
  TABLES,
  WINDOWS_Z,
  PENDANTS_Z,
  CAM_WAYPOINTS,
  LOOK_WAYPOINTS,
} from './stageData'

const damp = THREE.MathUtils.damp

// Deterministic pseudo-random (stable across reloads/SSR).
const rand = (i: number, s: number) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453
  return x - Math.floor(x)
}

// A shared soft radial sprite for flames, dust and steam.
function softTexture(): THREE.Texture {
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

/* ─────────────────────────────────────────────────────────────────────────
   Camera — one continuous dolly down the room, scroll-driven, with a little
   handheld breathing and pointer drift. Never cuts.
   ───────────────────────────────────────────────────────────────────────── */
function CameraDolly({ reduced }: { reduced: boolean }) {
  const { camera } = useThree()
  const t = useRef(0)
  const posCurve = useMemo(
    () => new THREE.CatmullRomCurve3(CAM_WAYPOINTS.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0.5),
    [],
  )
  const lookCurve = useMemo(
    () => new THREE.CatmullRomCurve3(LOOK_WAYPOINTS.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0.5),
    [],
  )
  const pos = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const s = THREE.MathUtils.clamp(scrollState.progress, 0, 1)
    t.current = damp(t.current, s, 3.2, dt)
    posCurve.getPoint(t.current, pos)
    lookCurve.getPoint(t.current, look)

    const time = state.clock.elapsedTime
    if (!reduced) {
      // Handheld breathing — tiny, slow, organic.
      pos.x += Math.sin(time * 0.31) * 0.05 + pointer.x * 0.5
      pos.y += Math.sin(time * 0.24 + 1.3) * 0.035 + pointer.y * 0.3
    }
    camera.position.copy(pos)
    camera.lookAt(look)
    // Almost imperceptible roll — a breath.
    camera.rotation.z = Math.sin(time * 0.19) * 0.006
  })
  return null
}

/* ── Room shell: reflective stone floor, walnut walls, dark ceiling ──────── */
function Room({ lowPerf }: { lowPerf: boolean }) {
  const midZ = (ROOM.zStart + ROOM.zEnd) / 2
  const len = ROOM.zStart - ROOM.zEnd + 20
  return (
    <group>
      {/* Polished stone floor with soft real-time reflections of the lights. */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, midZ]} receiveShadow>
        <planeGeometry args={[ROOM.width, len]} />
        <MeshReflectorMaterial
          resolution={lowPerf ? 128 : 512}
          mirror={0.55}
          blur={[500, 140]}
          mixBlur={1.1}
          mixStrength={2.4}
          roughness={0.9}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.2}
          color={PAL.warmBlack}
          metalness={0.35}
        />
      </mesh>

      {/* Side walls (walnut panelling). */}
      <mesh position={[-ROOM.width / 2, ROOM.height / 2, midZ]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[len, ROOM.height]} />
        <meshStandardMaterial color={PAL.walnutDark} roughness={0.72} metalness={0.04} />
      </mesh>
      <mesh position={[ROOM.width / 2, ROOM.height / 2, midZ]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[len, ROOM.height]} />
        <meshStandardMaterial color={PAL.walnutDark} roughness={0.72} metalness={0.04} />
      </mesh>

      {/* Ceiling. */}
      <mesh position={[0, ROOM.height, midZ]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[ROOM.width, len]} />
        <meshStandardMaterial color={PAL.warmBlack} roughness={0.9} />
      </mesh>

      {/* Back wall with a warm doorway glow — the way toward future chapters. */}
      <mesh position={[0, ROOM.height / 2, ROOM.zEnd]}>
        <planeGeometry args={[ROOM.width, ROOM.height]} />
        <meshStandardMaterial color={PAL.walnutDark} roughness={0.8} />
      </mesh>
      {/* a warm doorway glow — the way onward, kept gentle so it never blows out */}
      <mesh position={[0, 1.7, ROOM.zEnd + 0.3]}>
        <planeGeometry args={[1.7, 3.0]} />
        <meshBasicMaterial color={'#a8702e'} />
      </mesh>
      <mesh position={[0, 1.7, ROOM.zEnd + 0.5]}>
        <planeGeometry args={[2.3, 3.6]} />
        <meshBasicMaterial color={PAL.amber} transparent opacity={0.22} depthWrite={false} />
      </mesh>
    </group>
  )
}

/* ── A candle: wax + a flickering flame that reads as a light source ─────── */
function Candle({ position, seed, tex }: { position: [number, number, number]; seed: number; tex: THREE.Texture }) {
  const flame = useRef<THREE.Mesh>(null)
  const light = useRef<THREE.PointLight>(null)
  useFrame((state) => {
    const t = state.clock.elapsedTime
    // Layered sines → organic flicker.
    const f = 0.8 + 0.2 * Math.sin(t * 11 + seed * 6.2) + 0.08 * Math.sin(t * 23 + seed)
    if (flame.current) {
      const m = flame.current.material as THREE.MeshBasicMaterial
      m.opacity = 0.7 * f
      flame.current.scale.set(0.09 + 0.02 * f, 0.16 + 0.03 * f, 1)
    }
    if (light.current) light.current.intensity = 2.2 * f
  })
  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.028, 0.032, 0.12, 10]} />
        <meshStandardMaterial color={PAL.ivory} roughness={0.5} emissive={PAL.amber} emissiveIntensity={0.15} />
      </mesh>
      <Billboard position={[0, 0.2, 0]}>
        <mesh ref={flame}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={tex} color={PAL.amber} transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      </Billboard>
      {/* One small real light per candle would be too many; the flame glows via
          bloom and a very short-range point light gives the tabletop a pool. */}
      <pointLight ref={light} position={[0, 0.22, 0]} color={PAL.amber} intensity={2.4} distance={3.4} decay={2} />
    </group>
  )
}

/* ── A dining table with two chairs and a candle ─────────────────────────── */
function Table({ pos, rot, tex, index }: { pos: [number, number, number]; rot: number; tex: THREE.Texture; index: number }) {
  return (
    <group position={pos} rotation-y={rot}>
      {/* Walnut top */}
      <mesh position={[0, 0.74, 0]} castShadow>
        <boxGeometry args={[1.1, 0.05, 1.1]} />
        <meshStandardMaterial color={PAL.walnut} roughness={0.45} metalness={0.05} />
      </mesh>
      {/* Pedestal */}
      <mesh position={[0, 0.37, 0]}>
        <cylinderGeometry args={[0.06, 0.09, 0.74, 8]} />
        <meshStandardMaterial color={PAL.charcoal} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.28, 0.32, 0.04, 12]} />
        <meshStandardMaterial color={PAL.charcoal} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Two velvet chairs */}
      {[-0.85, 0.85].map((x, i) => (
        <group key={i} position={[x, 0, 0]} rotation-y={x > 0 ? Math.PI : 0}>
          <mesh position={[0, 0.24, 0]}>
            <boxGeometry args={[0.5, 0.08, 0.5]} />
            <meshStandardMaterial color={PAL.wine} roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.5, 0.22]}>
            <boxGeometry args={[0.5, 0.5, 0.07]} />
            <meshStandardMaterial color={PAL.wine} roughness={0.85} />
          </mesh>
        </group>
      ))}
      <Candle position={[0, 0.77, 0]} seed={rand(index, 3)} tex={tex} />
    </group>
  )
}

/* ── Warm window panels down the left wall ───────────────────────────────── */
function Windows() {
  return (
    <group>
      {WINDOWS_Z.map((z, i) => (
        <group key={i} position={[-5.92, 2.5, z]}>
          <mesh rotation-y={Math.PI / 2}>
            <planeGeometry args={[2.6, 3.4]} />
            <meshBasicMaterial color={PAL.amber} toneMapped={false} />
          </mesh>
          {/* muntins */}
          <mesh position={[0.02, 0, 0]} rotation-y={Math.PI / 2}>
            <planeGeometry args={[0.06, 3.4]} />
            <meshStandardMaterial color={PAL.walnutDark} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ── Pendant lamps down the ceiling centre; they sway almost invisibly ───── */
function Pendants() {
  const group = useRef<THREE.Group>(null)
  useFrame((state) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime
    g.children.forEach((c, i) => {
      c.rotation.z = Math.sin(t * 0.4 + i) * 0.02
    })
  })
  return (
    <group ref={group}>
      {PENDANTS_Z.map((z, i) => (
        <group key={i} position={[i % 2 ? 1.4 : -1.4, ROOM.height, z]}>
          <mesh position={[0, -0.5, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 1, 4]} />
            <meshStandardMaterial color={PAL.brass} metalness={0.9} roughness={0.4} />
          </mesh>
          <mesh position={[0, -1.05, 0]}>
            <coneGeometry args={[0.16, 0.26, 16, 1, true]} />
            <meshStandardMaterial color={PAL.brass} metalness={0.85} roughness={0.35} side={THREE.DoubleSide} emissive={PAL.amber} emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0, -1.16, 0]}>
            <sphereGeometry args={[0.05, 10, 10]} />
            <meshBasicMaterial color={PAL.amber} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ── Cocktail bar: counter, back-lit bottle shelf, brass rail ────────────── */
function Bar() {
  const bottles = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        x: -5 + (i % 11) * 1,
        y: i < 11 ? 2.0 : 2.7,
        c: [PAL.amber, PAL.gold, PAL.wine, PAL.olive, PAL.brass][i % 5],
        h: 0.4 + rand(i, 2) * 0.35,
      })),
    [],
  )
  return (
    <group position={[4.3, 0, -104]} rotation-y={-Math.PI / 2}>
      {/* counter */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[10, 1.1, 0.9]} />
        <meshStandardMaterial color={PAL.stoneDark} roughness={0.35} metalness={0.2} />
      </mesh>
      {/* marble top */}
      <mesh position={[0, 1.12, 0.02]}>
        <boxGeometry args={[10.2, 0.06, 1.0]} />
        <meshStandardMaterial color={PAL.stone} roughness={0.25} metalness={0.15} />
      </mesh>
      {/* back shelf */}
      <mesh position={[0, 2.35, -1.2]}>
        <boxGeometry args={[10.4, 3, 0.2]} />
        <meshStandardMaterial color={PAL.walnutDark} roughness={0.6} />
      </mesh>
      {/* backlight strip */}
      <mesh position={[0, 2.35, -1.06]}>
        <planeGeometry args={[10, 2.6]} />
        <meshBasicMaterial color={PAL.gold} toneMapped={false} transparent opacity={0.22} />
      </mesh>
      {/* bottles, catching the backlight */}
      {bottles.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, -1.0]}>
          <cylinderGeometry args={[0.07, 0.08, b.h, 8]} />
          <meshStandardMaterial color={b.c} roughness={0.15} metalness={0.1} emissive={b.c} emissiveIntensity={0.5} transparent opacity={0.92} />
        </mesh>
      ))}
      <pointLight position={[0, 2, 0.4]} color={PAL.gold} intensity={7} distance={12} decay={2} />
    </group>
  )
}

/* ── Open kitchen pass: a warm recess + rising steam. Stefan's anchor. ───── */
function KitchenPass({ tex }: { tex: THREE.Texture }) {
  const steam = useRef<THREE.Points>(null)
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const n = 40
    const pos = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (rand(i, 1) - 0.5) * 1.4
      pos[i * 3 + 1] = rand(i, 2) * 2
      pos[i * 3 + 2] = (rand(i, 3) - 0.5) * 0.6
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])
  useFrame((state) => {
    if (steam.current) steam.current.position.y = 1.4 + Math.sin(state.clock.elapsedTime * 0.3) * 0.05
    const m = steam.current?.material as THREE.PointsMaterial | undefined
    if (m) m.opacity = 0.05 + 0.03 * (0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 0.6))
  })
  return (
    <group position={[5.6, 0, -60]} rotation-y={-Math.PI / 2}>
      {/* recessed warm opening */}
      <mesh position={[0, 1.6, 0.1]}>
        <planeGeometry args={[3.2, 2]} />
        <meshBasicMaterial color={PAL.amber} toneMapped={false} transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[3.4, 0.14, 0.5]} />
        <meshStandardMaterial color={PAL.stone} roughness={0.3} metalness={0.2} />
      </mesh>
      <points ref={steam} geometry={geo} position={[0, 1.4, 0.3]}>
        <pointsMaterial size={0.5} map={tex} color={PAL.ivory} transparent opacity={0.07} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>
      <pointLight position={[0, 1.6, 0.6]} color={PAL.amber} intensity={5} distance={10} decay={2} />
    </group>
  )
}

/* ── Illuminated wine display, left wall. ────────────────────────────────── */
function WineRack() {
  const bottles = useMemo(
    () => Array.from({ length: 30 }, (_, i) => ({ x: (i % 6) * 0.34 - 0.85, y: 1.0 + Math.floor(i / 6) * 0.5 })),
    [],
  )
  return (
    <group position={[-5.85, 0, -108]} rotation-y={Math.PI / 2}>
      <mesh position={[0, 1.7, -0.12]}>
        <boxGeometry args={[2.4, 2.8, 0.24]} />
        <meshStandardMaterial color={PAL.walnutDark} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.7, -0.02]}>
        <planeGeometry args={[2.2, 2.6]} />
        <meshBasicMaterial color={PAL.wine} toneMapped={false} transparent opacity={0.28} />
      </mesh>
      {bottles.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, 0.05]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.05, 0.05, 0.28, 7]} />
          <meshStandardMaterial color={PAL.wine} roughness={0.3} emissive={PAL.wine} emissiveIntensity={0.4} />
        </mesh>
      ))}
      <pointLight position={[0, 1.7, 0.6]} color={PAL.gold} intensity={4} distance={7} decay={2} />
    </group>
  )
}

/* ── The private table — beautifully lit, waiting. Alice's anchor. ───────── */
function HeroTable({ tex }: { tex: THREE.Texture }) {
  return (
    <group position={[0, 0, -150]}>
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.75, 0.75, 0.05, 32]} />
        <meshStandardMaterial color={PAL.walnut} roughness={0.4} metalness={0.06} />
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.07, 0.11, 0.75, 10]} />
        <meshStandardMaterial color={PAL.charcoal} roughness={0.4} metalness={0.4} />
      </mesh>
      <Candle position={[0, 0.78, 0]} seed={0.5} tex={tex} />
      {/* a soft key light from above — the table already has its spotlight */}
      <spotLight position={[0, 4.2, 0]} target-position={[0, 0.8, 0]} color={PAL.amber} intensity={9} angle={0.5} penumbra={0.9} distance={9} decay={1.6} />
    </group>
  )
}

/* ── Dust motes drifting in the warm light ───────────────────────────────── */
function Dust({ count, tex }: { count: number; tex: THREE.Texture }) {
  const pts = useRef<THREE.Points>(null)
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand(i, 1) * 2 - 1) * 5.5
      pos[i * 3 + 1] = rand(i, 2) * 4 + 0.3
      pos[i * 3 + 2] = ROOM.zStart - rand(i, 3) * (ROOM.zStart - ROOM.zEnd)
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [count])
  useFrame((state) => {
    if (pts.current) pts.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.02) * 0.02
  })
  return (
    <points ref={pts} geometry={geo}>
      <pointsMaterial size={0.05} map={tex} color={PAL.gold} transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
    </points>
  )
}

/* ── In-scene image-based lighting (no external HDR): warm Lightformers ───── */
function StageEnvironment() {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={[PAL.warmBlack]} />
      <Lightformer form="rect" intensity={2.4} color={PAL.amber} position={[-5, 3, -50]} rotation-y={Math.PI / 2} scale={[30, 5, 1]} />
      <Lightformer form="rect" intensity={1.4} color={PAL.gold} position={[5, 3, -70]} rotation-y={-Math.PI / 2} scale={[26, 4, 1]} />
      <Lightformer form="rect" intensity={1.2} color={PAL.ivory} position={[0, 6, -40]} rotation-x={Math.PI / 2} scale={[8, 40, 1]} />
    </Environment>
  )
}

/**
 * The set. A single connected environment the camera travels through — room
 * shell, tables + candles, windows, pendants, bar, kitchen pass, wine display
 * and the private table — lit warmly and breathing through its lights. No
 * people, no words. Just the world.
 */
export function Restaurant({ reduced, lowPerf }: { reduced: boolean; lowPerf: boolean }) {
  const tex = useMemo(softTexture, [])
  return (
    <>
      <fogExp2 attach="fog" args={[PAL.warmBlack, 0.0125]} />
      <ambientLight intensity={0.2} color={PAL.amber} />
      <hemisphereLight intensity={0.22} color={PAL.amber} groundColor={PAL.warmBlack} />
      {/* Soft warm fills so the walnut and velvet read without flattening — the
          room glows from within rather than from a single hard key. */}
      <pointLight position={[0, 3.2, -28]} color={PAL.amber} intensity={4} distance={34} decay={1.6} />
      <pointLight position={[0, 3.2, -78]} color={PAL.gold} intensity={4} distance={34} decay={1.6} />
      <pointLight position={[0, 3.2, -124]} color={PAL.amber} intensity={3.4} distance={34} decay={1.6} />

      <StageEnvironment />
      <CameraDolly reduced={reduced} />

      <Room lowPerf={lowPerf} />
      {TABLES.map((t, i) => (
        <Table key={i} pos={t.pos} rot={t.rot} tex={tex} index={i} />
      ))}
      <Windows />
      <Pendants />
      <Bar />
      <KitchenPass tex={tex} />
      <WineRack />
      <HeroTable tex={tex} />
      {!reduced && <Dust count={lowPerf ? 120 : 260} tex={tex} />}
    </>
  )
}
