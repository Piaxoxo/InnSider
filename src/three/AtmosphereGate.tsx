import { lazy, Suspense, useEffect, useState } from 'react'
import './atmosphere.css'

/**
 * The door in front of the WebGL room.
 *
 * three.js, react-three-fiber and the postprocessing stack are by far the
 * heaviest thing the site ships. Loaded eagerly they sit in front of the first
 * paint: the guest stares at nothing while a renderer they cannot see yet is
 * parsed. So the room is code-split and only fetched once the page has painted
 * and the browser is idle.
 *
 * Until it arrives — and forever, on devices that should not be asked — the
 * same `.atmosphere` element holds the ground with its CSS candle-glow
 * fallback and the readability scrim. Nothing moves, nothing shifts; the light
 * simply starts breathing a moment later.
 */

const Atmosphere = lazy(() => import('./Atmosphere').then((m) => ({ default: m.Atmosphere })))

/**
 * Should this device be asked to run a fullscreen shader at all?
 *
 * Deliberately narrow: only genuinely constrained cases opt out, because the
 * living light IS the site. A phone on a train is fine; a data-saving browser
 * on a two-core device is not.
 */
function canAffordWebGL(): boolean {
  if (typeof window === 'undefined') return false

  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string }
    deviceMemory?: number
  }

  // The guest has explicitly asked the browser to spend less.
  if (nav.connection?.saveData) return false
  // 2G/slow-3G: the chunk alone would cost more than the effect is worth.
  if (nav.connection?.effectiveType && /(^|-)2g$/.test(nav.connection.effectiveType)) return false
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory < 2) return false
  if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 2) return false

  // No WebGL, no room.
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export function AtmosphereGate({ showOrb = true }: { showOrb?: boolean }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!canAffordWebGL()) return

    let cancelled = false
    const enter = () => {
      if (!cancelled) setOpen(true)
    }

    // Wait for the browser to be idle, so the first paint and the fonts win the
    // race. requestIdleCallback is not everywhere in Safari — fall back to a
    // short timer, which lands after paint either way.
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      cancelIdleCallback?: (id: number) => void
    }
    const idle = typeof w.requestIdleCallback === 'function'
    const id = idle ? w.requestIdleCallback!(enter, { timeout: 2000 }) : window.setTimeout(enter, 600)

    return () => {
      cancelled = true
      if (idle) w.cancelIdleCallback?.(id)
      else window.clearTimeout(id)
    }
  }, [])

  // The fallback is the same element the real atmosphere renders into, so the
  // candle-glow gradient and the scrim are on screen from the very first frame.
  const ground = <div className="atmosphere" aria-hidden="true" />

  if (!open) return ground
  return (
    <Suspense fallback={ground}>
      <Atmosphere showOrb={showOrb} />
    </Suspense>
  )
}
