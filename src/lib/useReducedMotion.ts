import { useEffect, useState } from 'react'

/**
 * Tracks the user's reduced-motion preference reactively.
 * Everything cinematic in this site checks this: when true, we swap
 * transforms for gentle fades and freeze the ambient WebGL motion.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}

/** Non-reactive check for use outside React (module init, event handlers). */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Coarse-pointer / touch detection — drives cursor + interaction fidelity. */
export function isTouch(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(hover: none), (pointer: coarse)').matches
}
