import { useEffect, useRef } from 'react'
import { isTouch, prefersReducedMotion } from '../lib/useReducedMotion'
import './cursor.css'

/**
 * A soft brass cursor that trails the pointer and swells over interactive
 * elements — the small luxury that makes the whole surface feel responsive.
 * Runs entirely on rAF + transforms (no per-frame React state). Disabled on
 * touch and under reduced motion, where the native cursor is restored.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isTouch() || prefersReducedMotion()) return

    document.body.classList.add('has-custom-cursor')
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const rpos = { x: target.x, y: target.y }
    let hovering = false
    let raf = 0

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX
      target.y = e.clientY
      if (dot.current) {
        dot.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
      }
      // Detect interactive target under pointer.
      const el = e.target as HTMLElement | null
      const interactive = !!el?.closest('a, button, [data-cursor="hover"], input, textarea, select')
      if (interactive !== hovering) {
        hovering = interactive
        ring.current?.classList.toggle('is-hover', hovering)
      }
    }

    const loop = () => {
      rpos_lerp()
      if (ring.current) {
        ring.current.style.transform = `translate3d(${rpos.x}px, ${rpos.y}px, 0)`
      }
      raf = requestAnimationFrame(loop)
    }
    const rpos_lerp = () => {
      rpos.x += (target.x - rpos.x) * 0.16
      rpos.y += (target.y - rpos.y) * 0.16
    }

    const onLeave = () => ring.current?.classList.add('is-hidden')
    const onEnter = () => ring.current?.classList.remove('is-hidden')

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    document.addEventListener('pointerenter', onEnter)
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('pointerenter', onEnter)
      document.body.classList.remove('has-custom-cursor')
    }
  }, [])

  if (typeof window !== 'undefined' && (isTouch() || prefersReducedMotion())) return null

  return (
    <>
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
      <div ref={ring} className="cursor-ring" aria-hidden="true" />
    </>
  )
}
