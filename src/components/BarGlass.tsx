import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/useReducedMotion'
import '../three/glass.css'

/**
 * The door in front of the glass.
 *
 * Chapter five sits far below the fold, so its renderer has no business being
 * fetched at load. This wrapper carries no three.js at all: it watches for the
 * bar coming into view, and only then pulls the scene in. Until it arrives —
 * and permanently, where WebGL is missing or motion is unwelcome — a drawn
 * coupe stands in its place, so the column is never an empty hole.
 *
 * It also owns the scroll reading. The chapter's own travel through the
 * viewport (not the page's overall progress) is what turns the wine glass into
 * a tumbler, so the transformation is tied to the drinks the guest is reading.
 */

const GlassStage = lazy(() => import('../three/GlassStage').then((m) => ({ default: m.GlassStage })))

/**
 * Das Etikett steht bewusst hier und nicht in der Szene. Es aus dem Bild-Loop
 * heraus zu setzen hieße, einen Zustand der DOM-Wurzel aus der Wurzel des
 * Canvas anzustoßen — das kommt nicht verlässlich an, und das Etikett blieb
 * dann auf dem vorigen Glas stehen. Hier liest es denselben Fortschritt, aus
 * dem die Szene ihre Form baut.
 */
const NAMES = ['Weinglas', 'Coupe', 'Tumbler']

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export function BarGlass() {
  const host = useRef<HTMLDivElement>(null)
  const progress = useRef(0)
  const [live, setLive] = useState(false)
  const [name, setName] = useState(NAMES[0])

  useEffect(() => {
    const el = host.current
    if (!el) return
    if (prefersReducedMotion() || !hasWebGL()) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLive(true)
          io.disconnect()
        }
      },
      // Start fetching a screen early, so it has arrived by the time it matters.
      { rootMargin: '100% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // The chapter's travel through the viewport.
  //
  // Raw, that travel runs from 0 as the column's bottom edge appears to 1 once
  // its top edge has gone — but at either extreme the glass is barely on
  // screen, so the first and last glass would never actually be seen. The
  // middle stretch, where the column really is in view, is stretched to cover
  // the whole journey instead.
  useEffect(() => {
    const el = host.current
    if (!el) return
    const read = () => {
      const r = el.getBoundingClientRect()
      const span = window.innerHeight + r.height
      const raw = span > 0 ? (window.innerHeight - r.top) / span : 0
      const t = (raw - 0.24) / (0.78 - 0.24)
      const p = Math.min(1, Math.max(0, t))
      progress.current = p
      setName(NAMES[Math.round(p * (NAMES.length - 1))])
    }
    read()
    window.addEventListener('scroll', read, { passive: true })
    window.addEventListener('resize', read)
    return () => {
      window.removeEventListener('scroll', read)
      window.removeEventListener('resize', read)
    }
  }, [])

  const still = <div className="glass__still" aria-hidden="true" />

  return (
    <div ref={host} className="glass-host">
      {live ? (
        <Suspense fallback={still}>
          <GlassStage progressRef={progress} />
        </Suspense>
      ) : (
        still
      )}
      {live && (
        <span className="glass__name" aria-hidden="true">
          {name}
        </span>
      )}
    </div>
  )
}
