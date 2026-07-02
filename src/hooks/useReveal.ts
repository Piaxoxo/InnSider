import { useEffect, useRef } from 'react'
import { gsap } from '../lib/scroll'
import { prefersReducedMotion } from '../lib/useReducedMotion'

type RevealOptions = {
  /** stagger between children matched by selector, in seconds */
  stagger?: number
  /** vertical travel in px */
  y?: number
  /** child selector to animate; defaults to direct reveal targets */
  selector?: string
  /** delay before start */
  delay?: number
  /** ScrollTrigger start position */
  start?: string
  /** duration */
  duration?: number
}

/**
 * Cinematic scroll reveal. Attaches to a container ref; animates either the
 * container or matched children up from a soft blur-fade as they enter view.
 * Under reduced motion it simply ensures everything is visible (no transform).
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(opts: RevealOptions = {}) {
  const ref = useRef<T>(null)
  const { stagger = 0.12, y = 40, selector, delay = 0, start = 'top 82%', duration = 1.1 } = opts

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const targets = selector ? el.querySelectorAll<HTMLElement>(selector) : [el]
    if (!targets.length) return

    if (prefersReducedMotion()) {
      gsap.set(targets, { autoAlpha: 1, y: 0, filter: 'none' })
      return
    }

    const ctx = gsap.context(() => {
      gsap.set(targets, { autoAlpha: 0, y, filter: 'blur(8px)' })
      gsap.to(targets, {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
        duration,
        delay,
        ease: 'power3.out',
        stagger,
        scrollTrigger: { trigger: el, start },
      })
    }, el)

    return () => ctx.revert()
  }, [stagger, y, selector, delay, start, duration])

  return ref
}

/**
 * Line-by-line masked reveal for headlines. Wrap each line in
 * `.reveal-line > span` (see global.css) and pass the container ref.
 */
export function useLineReveal<T extends HTMLElement = HTMLElement>(start = 'top 85%') {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const lines = el.querySelectorAll<HTMLElement>('.reveal-line > span')
    if (!lines.length) return

    if (prefersReducedMotion()) {
      gsap.set(lines, { yPercent: 0, autoAlpha: 1 })
      return
    }

    const ctx = gsap.context(() => {
      gsap.set(lines, { yPercent: 115 })
      gsap.to(lines, {
        yPercent: 0,
        duration: 1.2,
        ease: 'power4.out',
        stagger: 0.11,
        scrollTrigger: { trigger: el, start },
      })
    }, el)

    return () => ctx.revert()
  }, [start])

  return ref
}
