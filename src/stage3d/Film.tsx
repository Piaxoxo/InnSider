import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { scrollState } from '../lib/scroll'
import { pointer } from '../lib/pointer'
import { PAL } from './stageData'
import { MOMENTS, VIDEO_SLOTS, COUNTER } from './film'
import { VideoMoment } from './VideoMoment'
import { Counter, Candle, WineGlass, Clink, Cocktail, Shaker, Pour, Plates, softTexture } from './FilmProps'

const damp = THREE.MathUtils.damp

/* Camera — one continuous dolly along the moment spline, scroll-driven, with a
   little handheld breathing. The world (objects, focus) makes the transitions. */
function FilmCamera({ reduced }: { reduced: boolean }) {
  const { camera } = useThree()
  const t = useRef(0)
  const posCurve = useMemo(
    () => new THREE.CatmullRomCurve3(MOMENTS.map((m) => new THREE.Vector3(...m.cam)), false, 'catmullrom', 0.5),
    [],
  )
  const lookCurve = useMemo(
    () => new THREE.CatmullRomCurve3(MOMENTS.map((m) => new THREE.Vector3(...m.look)), false, 'catmullrom', 0.5),
    [],
  )
  const pos = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const s = THREE.MathUtils.clamp(scrollState.progress, 0, 1)
    t.current = damp(t.current, s, 3, dt)
    posCurve.getPoint(t.current, pos)
    lookCurve.getPoint(t.current, look)
    const time = state.clock.elapsedTime
    if (!reduced) {
      pos.x += Math.sin(time * 0.3) * 0.02 + pointer.x * 0.12
      pos.y += Math.sin(time * 0.23 + 1.1) * 0.014 + pointer.y * 0.08
    }
    camera.position.copy(pos)
    camera.lookAt(look)
    camera.rotation.z = Math.sin(time * 0.17) * 0.005
  })
  return null
}

/* In-scene IBL — warm rects that give the crystal, marble and metal something
   to reflect (no external HDR). */
function FilmEnv() {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={[PAL.warmBlack]} />
      <Lightformer form="rect" intensity={2.6} color={PAL.amber} position={[-2, 2, -10]} rotation-y={Math.PI / 2} scale={[12, 4, 1]} />
      <Lightformer form="rect" intensity={1.8} color={PAL.gold} position={[2, 2.4, -22]} rotation-y={-Math.PI / 2} scale={[10, 3, 1]} />
      <Lightformer form="rect" intensity={1.4} color={PAL.ivory} position={[0, 4, -18]} rotation-x={Math.PI / 2} scale={[3, 30, 1]} />
    </Environment>
  )
}

/* The warm room glow the camera rises into at the end — SCENE 07. */
function RoomReveal() {
  return (
    <group position={[0, 1.9, -52]}>
      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[26, 10]} />
        <meshBasicMaterial color={'#2a1c10'} />
      </mesh>
      {[-6, -2.4, 1.4, 5].map((x, i) => (
        <mesh key={i} position={[x, 0.4, -0.6]}>
          <planeGeometry args={[1.1, 2.4]} />
          <meshBasicMaterial color={PAL.amber} transparent opacity={0.5} />
        </mesh>
      ))}
      <pointLight position={[0, 1, 3]} color={PAL.amber} intensity={6} distance={22} decay={1.6} />
    </group>
  )
}

function MomentProp({ prop, pos, tex, lowPerf }: { prop: string; pos: [number, number, number]; tex: THREE.Texture; lowPerf: boolean }) {
  switch (prop) {
    case 'wine':
      return (
        <group position={pos}>
          <WineGlass position={[0, 0, 0]} lowPerf={lowPerf} />
          <Candle position={[0.16, 0, 0.1]} tex={tex} seed={0.2} />
        </group>
      )
    case 'cocktail':
      return <Cocktail position={pos} lowPerf={lowPerf} />
    case 'clink':
      return <Clink position={pos} tex={tex} lowPerf={lowPerf} />
    case 'shaker':
      return <Shaker position={pos} />
    case 'pour':
      return <Pour position={pos} lowPerf={lowPerf} />
    case 'plates':
      return <Plates position={pos} tex={tex} />
    default:
      return null
  }
}

/**
 * THE FILM. A continuous move through intimate close-ups on the marble counter —
 * wine, cocktail, a clink, the shaker, the pour, the pass — then a rise into the
 * room. Objects are Three.js; human actions are video slots (awaiting footage).
 */
export function Film({ reduced, lowPerf }: { reduced: boolean; lowPerf: boolean }) {
  const tex = useMemo(softTexture, [])
  return (
    <>
      <fogExp2 attach="fog" args={[PAL.warmBlack, 0.02]} />
      <ambientLight intensity={0.16} color={PAL.amber} />
      <hemisphereLight intensity={0.16} color={PAL.amber} groundColor={PAL.warmBlack} />

      <FilmEnv />
      <FilmCamera reduced={reduced} />
      <Counter lowPerf={lowPerf} />

      {MOMENTS.map((m) => (
        <group key={m.id}>
          <MomentProp prop={m.prop} pos={m.propPos} tex={tex} lowPerf={lowPerf} />
          {/* a soft key light lifts each hero object off the dark */}
          {m.prop !== 'none' && (
            <pointLight position={[m.propPos[0] + 0.3, m.propPos[1] + 0.7, m.propPos[2] + 0.3]} color={PAL.amber} intensity={3} distance={2.8} decay={2} />
          )}
          {m.video && (
            <VideoMoment
              slot={VIDEO_SLOTS[m.video.slot]}
              position={m.video.pos}
              rotation={m.video.rot ?? 0}
              scale={m.video.scale ?? 1.6}
            />
          )}
        </group>
      ))}

      <RoomReveal />

      {/* dust in the warm light along the counter */}
      {!reduced && <CounterDust count={lowPerf ? 80 : 160} tex={tex} />}
    </>
  )
}

function CounterDust({ count, tex }: { count: number; tex: THREE.Texture }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const p = new Float32Array(count * 3)
    const rand = (i: number, s: number) => {
      const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453
      return x - Math.floor(x)
    }
    for (let i = 0; i < count; i++) {
      p[i * 3] = (rand(i, 1) * 2 - 1) * 1.6
      p[i * 3 + 1] = 0.9 + rand(i, 2) * 1.4
      p[i * 3 + 2] = COUNTER.from - rand(i, 3) * (COUNTER.from - COUNTER.to)
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3))
    return g
  }, [count])
  const pts = useRef<THREE.Points>(null)
  useFrame((s) => {
    if (pts.current) pts.current.position.y = Math.sin(s.clock.elapsedTime * 0.1) * 0.05
  })
  return (
    <points ref={pts} geometry={geo}>
      <pointsMaterial size={0.03} map={tex} color={PAL.gold} transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
    </points>
  )
}
