import { useEffect, useState } from 'react'
import { scrollState } from '../lib/scroll'

/**
 * React-friendly read of the global Lenis scroll progress (0..1). The raw value
 * on `scrollState` updates every frame outside React; this hook samples it and
 * only re-renders when it moves past `epsilon`, so chapters can tint, parallax
 * or drive the atmosphere off overall progress without a render every frame.
 */
export function useScrollProgress(epsilon = 0.002): number {
  const [p, setP] = useState(0)

  useEffect(() => {
    let raf = 0
    let last = -1
    const loop = () => {
      const v = scrollState.progress
      if (Math.abs(v - last) >= epsilon) {
        last = v
        setP(v)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [epsilon])

  return p
}
