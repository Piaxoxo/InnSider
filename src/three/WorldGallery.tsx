import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { pointer } from '../lib/pointer'
import { memories, type Memory } from '../content/memories'

/**
 * The Memory Gallery — an immersive flythrough of every delivered photo.
 *
 * Each memory is a convex shader slab floating in depth; the camera flies
 * through them (scroll-driven, frame-independently damped) and rests on a
 * full-bleed finale. Photos stream in and out by proximity — only slabs near
 * the camera hold a texture in memory, so the whole set (37+) plays smoothly
 * even on a phone. Each slab auto-sizes to its real aspect ratio. Hovering a
 * slab surfaces its caption; clicking opens a cinematic focus view (handled in
 * the DOM by the Gallery chapter). Responsive fov + centre-pull for narrow
 * screens; lower DPR on touch.
 */

const GAP = 5.0
const total = memories.length
const damp = THREE.MathUtils.damp
const loader = new THREE.TextureLoader()

// Proximity thresholds (hysteresis prevents load/dispose flicker at the edge).
const LOAD_DIST = GAP * 4.2
const DISPOSE_DIST = GAP * 5.4

const FINALE_URL = memories.find((m) => m.url.includes('interior-bar-wide'))?.url ?? memories[0].url
const FINALE_H = 7
const FINALE_W = 12.6
const FINALE_Z = -total * GAP - 12

// Deterministic per-slab jitter (no Math.random → resume/SSR safe).
const frac = (n: number) => n - Math.floor(n)
const rand = (i: number, s: number) => frac(Math.sin((i + 1) * (12.9898 + s * 4.1414)) * 43758.5453)

const photoVert = /* glsl */ `
  uniform float uTime, uNear;
  varying vec2 vUv;
  varying float vShade;
  void main() {
    vUv = uv;
    vec3 p = position;
    float cx = uv.x - 0.5;
    float cy = uv.y - 0.5;
    p.z += (cx * cx) * -1.35 + (cy * cy) * -0.7;
    p.z += sin(uv.x * 9.0 + uTime * 1.3) * 0.03 * uNear;
    p.z += cos(uv.y * 7.0 - uTime * 1.1) * 0.02 * uNear;
    vShade = 1.0 - (cx * cx + cy * cy) * 1.4;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`
const photoFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform float uOpacity, uNear, uHover;
  varying vec2 vUv;
  varying float vShade;
  void main() {
    vec3 c = texture2D(uTex, vUv).rgb;
    c *= mix(0.72, 1.12, clamp(vShade, 0.0, 1.0));
    c += vec3(0.05, 0.035, 0.015) * uNear;
    c += vec3(0.09, 0.07, 0.035) * uHover; // warm lift on hover
    gl_FragColor = vec4(c, uOpacity);
  }
`

type PhotoCommon = {
  memory: Memory
  index: number
  xFactor: number
  segments: number
  onHover: (m: Memory | null) => void
  onSelect: (m: Memory) => void
}

/** Always-mounted slot: owns proximity load/dispose; renders the mesh once ready. */
function PhotoSlot(props: PhotoCommon) {
  const [tex, setTex] = useState<THREE.Texture | null>(null)
  const loading = useRef(false)
  const z = -props.index * GAP

  useFrame((state) => {
    const dist = Math.abs(state.camera.position.z - z)
    if (!tex && !loading.current && dist < LOAD_DIST) {
      loading.current = true
      loader.load(props.memory.url, (t) => {
        t.colorSpace = THREE.SRGBColorSpace
        t.anisotropy = 4
        setTex(t)
        loading.current = false
      })
    } else if (tex && dist > DISPOSE_DIST) {
      tex.dispose()
      setTex(null)
    }
  })

  if (!tex) return null
  return <PhotoMesh {...props} tex={tex} z={z} />
}

function PhotoMesh({
  memory,
  index,
  xFactor,
  segments,
  tex,
  z,
  onHover,
  onSelect,
}: PhotoCommon & { tex: THREE.Texture; z: number }) {
  const mesh = useRef<THREE.Mesh>(null)
  const hovered = useRef(false)

  const img = tex.image as { width: number; height: number }
  const aspect = img && img.height ? img.width / img.height : 1.4
  const h = aspect >= 1 ? 2.4 : 3.0
  const w = h * aspect

  const side = index % 2 === 0 ? 1 : -1
  const centred = index % 6 === 0
  const px = centred ? (rand(index, 1) - 0.5) * 0.8 : side * (2.0 + rand(index, 2) * 0.9) * xFactor
  const py = (rand(index, 3) - 0.5) * 0.9

  const uniforms = useMemo(
    () => ({
      uTex: { value: tex },
      uTime: { value: 0 },
      uNear: { value: 0 },
      uOpacity: { value: 0 },
      uHover: { value: 0 },
    }),
    [tex],
  )

  useFrame((state, delta) => {
    const m = mesh.current
    if (!m) return
    const dt = Math.min(delta, 0.05)
    const signed = state.camera.position.z - z
    const near = Math.exp(-(signed * signed) / 18)
    const frontFade = THREE.MathUtils.clamp((16 - signed) / 8, 0, 1)
    const backFade = THREE.MathUtils.clamp((signed + 1.6) / 1.6, 0, 1)
    const opacity = frontFade * backFade

    uniforms.uTime.value += dt
    uniforms.uNear.value = damp(uniforms.uNear.value, near, 6, dt)
    uniforms.uOpacity.value = damp(uniforms.uOpacity.value, opacity, 8, dt)
    uniforms.uHover.value = damp(uniforms.uHover.value, hovered.current ? 1 : 0, 8, dt)

    const targetRotY = side * (0.34 - signed * 0.03) + pointer.x * 0.1
    const targetRotX = -pointer.y * 0.05 + Math.sin(state.clock.elapsedTime * 0.3 + index) * 0.015
    m.rotation.y = damp(m.rotation.y, targetRotY, 5, dt)
    m.rotation.x = damp(m.rotation.x, targetRotX, 5, dt)
    const lift = hovered.current ? 0.1 : 0
    // Uniform breathing zoom; the aspect lives in the geometry, not the scale.
    m.scale.setScalar(damp(m.scale.x, 0.9 + near * 0.22 + lift, 6, dt))
    m.position.y = py + Math.sin(state.clock.elapsedTime * 0.4 + index) * 0.06
  })

  const enter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (uniforms.uOpacity.value < 0.25) return // ignore near-invisible slabs
    hovered.current = true
    onHover(memory)
    document.body.style.cursor = 'pointer'
  }
  const leave = () => {
    hovered.current = false
    onHover(null)
    document.body.style.cursor = ''
  }
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (uniforms.uOpacity.value < 0.25) return
    onSelect(memory)
  }

  return (
    <mesh
      ref={mesh}
      position={[px, py, z]}
      onPointerOver={enter}
      onPointerOut={leave}
      onClick={click}
    >
      <planeGeometry args={[w, h, segments, Math.round(segments * 0.7)]} />
      <shaderMaterial
        vertexShader={photoVert}
        fragmentShader={photoFrag}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

const finaleVert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`
const finaleFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv;
    uv.y = (uv.y - 0.5) * (1.5 / 1.8) + 0.5;
    vec3 c = texture2D(uTex, uv).rgb;
    float vig = smoothstep(1.15, 0.35, length(vUv - 0.5));
    c *= mix(0.72, 1.0, vig);
    gl_FragColor = vec4(c, uOpacity);
  }
`

function Finale() {
  const tex = useTexture(FINALE_URL)
  tex.colorSpace = THREE.SRGBColorSpace
  const uniforms = useMemo(() => ({ uTex: { value: tex }, uOpacity: { value: 0 } }), [tex])
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const dist = state.camera.position.z - FINALE_Z
    const target = THREE.MathUtils.clamp((22 - dist) / 12, 0, 1)
    uniforms.uOpacity.value = damp(uniforms.uOpacity.value, target, 6, dt)
  })
  return (
    <mesh position={[0, 0, FINALE_Z]}>
      <planeGeometry args={[FINALE_W, FINALE_H]} />
      <shaderMaterial fragmentShader={finaleFrag} vertexShader={finaleVert} uniforms={uniforms} transparent depthWrite={false} />
    </mesh>
  )
}

function Rig({ progressRef, catRef }: { progressRef: { v: number }; catRef?: { current: HTMLElement | null } }) {
  const { camera } = useThree()
  const smooth = useRef(0)
  const lastCat = useRef('')
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    smooth.current = damp(smooth.current, progressRef.v, 6, dt)
    const fov = ((camera as THREE.PerspectiveCamera).fov * Math.PI) / 180
    const stopD = ((FINALE_H / 2) / Math.tan(fov / 2)) * 0.94
    const endZ = FINALE_Z + stopD
    const targetZ = 6 + smooth.current * (endZ - 6)
    camera.position.z = damp(camera.position.z, targetZ, 5, dt)
    camera.position.x = damp(camera.position.x, pointer.x * 0.7, 3.5, dt)
    camera.position.y = damp(camera.position.y, pointer.y * 0.45, 3.5, dt)
    camera.lookAt(0, 0, camera.position.z - 6)

    // Live category readout — the room you are currently moving through.
    if (catRef?.current) {
      const idx = THREE.MathUtils.clamp(Math.round(-camera.position.z / GAP), 0, total - 1)
      const cat = memories[idx]?.category ?? ''
      if (cat !== lastCat.current) {
        lastCat.current = cat
        catRef.current.textContent = cat
      }
    }
  })
  return null
}

function Scene({
  progressRef,
  segments,
  catRef,
  onHover,
  onSelect,
}: {
  progressRef: { v: number }
  segments: number
  catRef?: { current: HTMLElement | null }
  onHover: (m: Memory | null) => void
  onSelect: (m: Memory) => void
}) {
  const { size, camera } = useThree()
  const aspect = size.width / Math.max(1, size.height)
  const portrait = aspect < 1
  const xFactor = THREE.MathUtils.clamp(aspect / 1.5, 0.32, 1)

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    cam.fov = portrait ? 66 : 46
    cam.updateProjectionMatrix()
  }, [portrait, camera])

  return (
    <>
      <Rig progressRef={progressRef} catRef={catRef} />
      {memories.map((m, i) => (
        <PhotoSlot
          key={m.url}
          memory={m}
          index={i}
          xFactor={xFactor}
          segments={segments}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}
      <Finale />
    </>
  )
}

export function WorldGallery({
  progressRef,
  lowPerf = false,
  catRef,
  onHover,
  onSelect,
}: {
  progressRef: { v: number }
  lowPerf?: boolean
  catRef?: { current: HTMLElement | null }
  onHover: (m: Memory | null) => void
  onSelect: (m: Memory) => void
}) {
  return (
    <Canvas
      gl={{ antialias: !lowPerf, alpha: true, powerPreference: 'high-performance' }}
      dpr={lowPerf ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, 0, 6], fov: 46 }}
    >
      <Suspense fallback={null}>
        <Scene
          progressRef={progressRef}
          segments={lowPerf ? 20 : 40}
          catRef={catRef}
          onHover={onHover}
          onSelect={onSelect}
        />
      </Suspense>
    </Canvas>
  )
}
