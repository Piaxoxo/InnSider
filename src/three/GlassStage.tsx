import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  profileAt,
  toLathePoints,
  liquidPoints,
  floorAt,
  makeRoomTexture,
  glassVert,
  glassFrag,
} from './glass'
import './glass.css'

/**
 * The glass on the bar.
 *
 * One object, lit by a painted room and rebuilt every frame from a blended
 * profile: as the chapter scrolls past, a wine glass becomes a coupe becomes a
 * tumbler, and it fills as it goes. Glass is the one thing real-time rendering
 * does better than photography — refraction, dispersion and a moving highlight
 * cannot be faked in a still — so it is the one thing here worth rendering.
 */

const damp = THREE.MathUtils.damp

/** The painted room, as a texture the glass shader can trace rays into. */
function useRoom(): THREE.Texture {
  const tex = useMemo(makeRoomTexture, [])
  useEffect(() => () => tex.dispose(), [tex])
  return tex
}

/** Uniforms for one body of glass — the shell and the drink differ only here. */
function glassUniforms(room: THREE.Texture, o: {
  tint: string
  density: number
  base: number
  edge: number
  ior: number
  spread: number
  exposure: number
}) {
  return {
    uRoom: { value: room },
    uTint: { value: new THREE.Color(o.tint) },
    uDensity: { value: o.density },
    uBase: { value: o.base },
    uEdge: { value: o.edge },
    uIor: { value: o.ior },
    uSpread: { value: o.spread },
    uKey: { value: new THREE.Vector3(-3, 4, 2.5) },
    uExposure: { value: o.exposure },
  }
}

function Glass({
  progressRef,
  reduced,
  room,
}: {
  progressRef: MutableRefObject<number>
  reduced: boolean
  room: THREE.Texture
}) {
  // Das Getränk ist dichter und farbiger als die Hülle; sonst ist es derselbe
  // Stoff. Beide streuen dasselbe gemalte Zimmer.
  const shellU = useMemo(
    () => glassUniforms(room, { tint: '#f6efe0', density: 0.16, base: 0.07, edge: 0.95, ior: 1.5, spread: 0.014, exposure: 4.6 }),
    [room],
  )
  const drinkU = useMemo(
    () => glassUniforms(room, { tint: '#ffb45c', density: 0.92, base: 0.9, edge: 0.1, ior: 1.36, spread: 0.006, exposure: 5.2 }),
    [room],
  )
  const group = useRef<THREE.Group>(null)
  const shell = useRef<THREE.Mesh>(null)
  const liquid = useRef<THREE.Mesh>(null)
  const eased = useRef(0)
  // Rebuilding the lathe every frame would be wasteful and invisible; the
  // silhouette is only re-cut when the blend has actually moved.
  const lastBuilt = useRef(-1)

  useFrame((state, delta) => {
    // Kein Deckel auf delta: `damp` ist für jeden Zeitschritt stabil, und ein
    // Deckel würde die Annäherung an langsame Geräte koppeln — dort käme die
    // Wandlung dann nie an ihrem Ende an.
    eased.current = damp(eased.current, THREE.MathUtils.clamp(progressRef.current, 0, 1), 3.2, delta)
    const t = eased.current

    if (group.current) {
      group.current.rotation.y = reduced ? 0.4 : state.clock.elapsedTime * 0.22
      group.current.position.y = -0.95 + Math.sin(state.clock.elapsedTime * 0.5) * 0.012
    }

    if (Math.abs(t - lastBuilt.current) > 0.004) {
      lastBuilt.current = t
      const profile = profileAt(t)

      if (shell.current) {
        const lp = toLathePoints(profile)
        shell.current.geometry.dispose()
        shell.current.geometry = new THREE.LatheGeometry(lp, 96)
      }
      if (liquid.current) {
        // The pour trails the morph a little, so the glass exists before it fills.
        const pts = liquidPoints(
          profile,
          floorAt(t),
          THREE.MathUtils.smoothstep(t, 0.05, 0.72) * 0.8,
        )
        liquid.current.geometry.dispose()
        liquid.current.geometry = pts.length
          ? new THREE.LatheGeometry(pts, 96)
          : new THREE.BufferGeometry()
        liquid.current.visible = pts.length > 0
      }
    }
  })

  return (
    <group ref={group}>
      {/* Das Getränk ist ein Körper, kein Hohlkörper: es schreibt Tiefe und
          zeigt nur seine Außenseite. Ohne das übermalen sich Vorder- und
          Rückwand gegenseitig und die Säule wirkt, als liefe sie nach unten
          zusammen. */}
      <mesh ref={liquid} renderOrder={1}>
        <shaderMaterial
          vertexShader={glassVert}
          fragmentShader={glassFrag}
          uniforms={drinkU}
          side={THREE.DoubleSide}
          transparent
          depthWrite
        />
      </mesh>

      <mesh ref={shell} renderOrder={2}>
        <shaderMaterial
          vertexShader={glassVert}
          fragmentShader={glassFrag}
          uniforms={shellU}
          side={THREE.DoubleSide}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

/** Das Zimmer entsteht erst im Canvas — es braucht ein document. */
function Scene(props: { progressRef: MutableRefObject<number>; reduced: boolean }) {
  const room = useRoom()
  return <Glass {...props} room={room} />
}

export function GlassStage({
  progressRef,
  reduced = false,
}: {
  progressRef: MutableRefObject<number>
  reduced?: boolean
}) {
  const dpr = useMemo<[number, number]>(() => [1, 1.6], [])

  return (
    <div className="glass">
      <Canvas
        className="glass__canvas"
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={dpr}
        camera={{ position: [0, 0.15, 4.2], fov: 34 }}
      >
        <Scene progressRef={progressRef} reduced={reduced} />
      </Canvas>
    </div>
  )
}
