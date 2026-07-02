import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from './useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null

/** A normalized 0..1 read of overall page scroll, updated every frame. */
export const scrollState = { progress: 0, velocity: 0 }

/**
 * Boots Lenis smooth scrolling and wires it into GSAP's ScrollTrigger + ticker
 * so scroll-driven animations and the smooth scroll share one clock.
 * Returns a teardown fn. No-op smoothing under reduced-motion.
 */
export function initSmoothScroll(): () => void {
  const reduced = prefersReducedMotion()

  lenis = new Lenis({
    duration: reduced ? 0 : 1.15,
    // Long, luxurious easing — deceleration you can feel.
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: !reduced,
    wheelMultiplier: 1,
    touchMultiplier: 1.4,
  })

  lenis.on('scroll', (e: { progress: number; velocity: number }) => {
    scrollState.progress = e.progress
    scrollState.velocity = e.velocity
    ScrollTrigger.update()
  })

  const raf = (time: number) => {
    lenis?.raf(time * 1000)
  }
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)

  return () => {
    gsap.ticker.remove(raf)
    lenis?.destroy()
    lenis = null
  }
}

export function getLenis(): Lenis | null {
  return lenis
}

/** Smoothly scroll to an element id (used by nav + CTAs). */
export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) {
    lenis.scrollTo(el, { offset: 0, duration: 1.6 })
  } else {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

export function stopScroll() {
  lenis?.stop()
}
export function startScroll() {
  lenis?.start()
}

export { gsap, ScrollTrigger }
