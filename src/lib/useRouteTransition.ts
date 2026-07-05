import { useEffect, useRef, useState } from 'react'
import type { Route } from './useRoute'
import { prefersReducedMotion } from './useReducedMotion'

/**
 * Turns an instant route swap into a cinematic curtain transition.
 *
 * When the route changes, a warm sheet rises to cover the screen ("cover"),
 * the underlying route is swapped while hidden, then the sheet lifts away
 * ("reveal"). The visitor never sees the hard cut — moving between the evening
 * and the back rooms feels like the same house dimming and coming back up.
 *
 * `shown` is the route currently rendered (lags the real route until covered).
 * `phase` drives the curtain overlay. Reduced motion swaps instantly.
 *
 * The machine is driven off `route` only; the currently-shown route is tracked
 * in a ref so mid-transition state updates never clear the pending timers.
 */
export type TransitionPhase = 'idle' | 'cover' | 'reveal'

const COVER_MS = 620
const REVEAL_MS = 620

export function useRouteTransition(route: Route): { shown: Route; phase: TransitionPhase } {
  const [shown, setShown] = useState<Route>(route)
  const [phase, setPhase] = useState<TransitionPhase>('idle')
  const shownRef = useRef<Route>(route)
  const timers = useRef<number[]>([])

  useEffect(() => {
    if (route === shownRef.current) return

    // A newer navigation supersedes any transition still in flight.
    timers.current.forEach(clearTimeout)
    timers.current = []

    if (prefersReducedMotion()) {
      shownRef.current = route
      setShown(route)
      window.scrollTo(0, 0)
      return
    }

    setPhase('cover')
    timers.current.push(
      window.setTimeout(() => {
        shownRef.current = route
        setShown(route)
        window.scrollTo(0, 0)
        setPhase('reveal')
      }, COVER_MS),
    )
    timers.current.push(window.setTimeout(() => setPhase('idle'), COVER_MS + REVEAL_MS))
  }, [route])

  // Clear any pending timers on unmount only.
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  return { shown, phase }
}
