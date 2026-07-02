import { useEffect } from 'react'

/** Global normalized pointer (-1..1) shared by WebGL + parallax layers. */
export const pointer = { x: 0, y: 0, tx: 0, ty: 0 }

/** Installs a single window listener that feeds the shared pointer target. */
export function usePointerTracking() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1
      pointer.ty = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
}

/** Frame-rate independent easing toward the target; call inside useFrame. */
export function easePointer(lerp = 0.06) {
  pointer.x += (pointer.tx - pointer.x) * lerp
  pointer.y += (pointer.ty - pointer.y) * lerp
}
