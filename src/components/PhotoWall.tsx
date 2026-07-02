import { useEffect, useRef } from 'react'
import type { PoolImage } from '../content/pools'
import { gsap } from '../lib/scroll'
import { isTouch, prefersReducedMotion } from '../lib/useReducedMotion'
import './photowall.css'

export interface WallCaption {
  title: string
  story?: string
}

/**
 * Auto-scaling masonry photo wall. Renders however many images a pool contains
 * — 3 or 50 — in a column masonry that naturally accommodates mixed portrait
 * and landscape shots, each with the same cinematic clip-reveal + 3-D tilt as
 * the rest of the site. Captions (optional) cycle across the images. Empty pool
 * → renders nothing (the caller supplies a curated fallback).
 */
export function PhotoWall({
  images,
  captions,
  className = '',
}: {
  images: PoolImage[]
  captions?: WallCaption[]
  className?: string
}) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el || !images.length || prefersReducedMotion()) return
    const frames = el.querySelectorAll<HTMLElement>('.wall__frame')
    const cleanups: Array<() => void> = []

    const ctx = gsap.context(() => {
      frames.forEach((frame) => {
        const img = frame.querySelector<HTMLElement>('img')
        gsap.set(frame, { transformPerspective: 1100, transformOrigin: 'center' })
        if (img) {
          gsap.fromTo(
            img,
            { clipPath: 'inset(0% 0% 100% 0%)', scale: 1.28, filter: 'brightness(0.6)' },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              scale: 1,
              filter: 'brightness(1)',
              duration: 1.5,
              ease: 'power3.out',
              scrollTrigger: { trigger: frame, start: 'top 92%' },
            },
          )
        }
        gsap.fromTo(
          frame,
          { rotateX: 7, y: 28 },
          { rotateX: 0, y: 0, duration: 1.3, ease: 'power3.out', scrollTrigger: { trigger: frame, start: 'top 92%' } },
        )

        if (!isTouch()) {
          const setRX = gsap.quickTo(frame, 'rotationX', { duration: 0.5, ease: 'power2.out' })
          const setRY = gsap.quickTo(frame, 'rotationY', { duration: 0.5, ease: 'power2.out' })
          const onMove = (e: PointerEvent) => {
            const r = frame.getBoundingClientRect()
            setRY(((e.clientX - r.left) / r.width - 0.5) * 8)
            setRX(-((e.clientY - r.top) / r.height - 0.5) * 8)
          }
          const onLeave = () => {
            setRX(0)
            setRY(0)
          }
          frame.addEventListener('pointermove', onMove)
          frame.addEventListener('pointerleave', onLeave)
          cleanups.push(() => {
            frame.removeEventListener('pointermove', onMove)
            frame.removeEventListener('pointerleave', onLeave)
          })
        }
      })
    }, el)

    return () => {
      ctx.revert()
      cleanups.forEach((c) => c())
    }
  }, [images])

  if (!images.length) return null

  return (
    <div className={`wall ${className}`} ref={root}>
      {images.map((img, i) => {
        const cap = captions && captions.length ? captions[i % captions.length] : undefined
        return (
          <figure className="wall__frame" key={img.src} data-cursor="hover">
            <img src={img.src} alt={cap?.title || 'InnSider'} loading="lazy" decoding="async" />
            {cap && (
              <figcaption>
                <span className="wall__title">{cap.title}</span>
                {cap.story && <span className="wall__story">{cap.story}</span>}
              </figcaption>
            )}
          </figure>
        )
      })}
    </div>
  )
}
