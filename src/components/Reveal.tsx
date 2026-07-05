import type { ElementType, ReactNode } from 'react'
import { useReveal } from '../hooks/useReveal'

/**
 * Declarative cinematic reveal — the reusable building block for every chapter
 * from Phase 3 on. Wraps content that rises out of a soft blur-fade as it enters
 * the viewport (scroll-driven, reduced-motion safe via useReveal). Use it
 * instead of hand-wiring gsap per section so the whole site breathes with one
 * consistent motion signature.
 *
 *   <Reveal as="p" y={24} delay={0.1}>…</Reveal>
 */
export function Reveal({
  children,
  as: Tag = 'div' as ElementType,
  className,
  y = 32,
  delay = 0,
  start,
  duration,
}: {
  children: ReactNode
  as?: ElementType
  className?: string
  y?: number
  delay?: number
  start?: string
  duration?: number
}) {
  const ref = useReveal<HTMLElement>({ y, delay, start, duration })
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
