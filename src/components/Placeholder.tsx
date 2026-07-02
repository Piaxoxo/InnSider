import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { MediaSlot } from '../content/assets'
import { gsap } from '../lib/scroll'
import { isTouch, prefersReducedMotion } from '../lib/useReducedMotion'
import './placeholder.css'

/**
 * Premium media slot. Renders the real asset once `slot.src` is delivered;
 * until then (or if a pre-wired file 404s) it draws a warm, art-directed
 * placeholder — the layout never breaks and no animation timing changes.
 *
 * Real images get a cinematic treatment automatically:
 *   • a clip-path reveal that unmasks the frame with a settling Ken-Burns zoom
 *     and a slight 3-D rotate as it scrolls into view, and
 *   • a subtle 3-D pointer tilt on interactive frames (parents marked
 *     data-cursor="hover"), for depth on hover.
 * Both stand down under reduced motion / touch.
 */
export function Placeholder({
  slot,
  className = '',
  rounded = true,
  eager = false,
}: {
  slot: MediaSlot
  className?: string
  rounded?: boolean
  eager?: boolean
}) {
  const style: CSSProperties = { aspectRatio: String(slot.ratio) }
  const ref = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)
  const showMedia = !!slot.src && !failed
  const resolvedSrc =
    slot.src && slot.src.startsWith('/') ? import.meta.env.BASE_URL + slot.src.slice(1) : slot.src

  useEffect(() => {
    const frame = ref.current
    if (!frame || !showMedia || prefersReducedMotion()) return
    const mediaEl = frame.querySelector<HTMLElement>('.ph__media')
    if (!mediaEl) return

    const ctx = gsap.context(() => {
      // Cinematic reveal: unmask + settle from a slight zoom & 3-D rotate.
      gsap.set(frame, { transformPerspective: 1100, transformOrigin: 'center' })
      gsap.fromTo(
        mediaEl,
        { clipPath: 'inset(0% 0% 100% 0%)', scale: 1.28, filter: 'brightness(0.6)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          scale: 1,
          filter: 'brightness(1)',
          duration: 1.5,
          ease: 'power3.out',
          scrollTrigger: { trigger: frame, start: 'top 90%' },
        },
      )
      gsap.fromTo(
        frame,
        { rotateX: 7, y: 26 },
        {
          rotateX: 0,
          y: 0,
          duration: 1.3,
          ease: 'power3.out',
          scrollTrigger: { trigger: frame, start: 'top 90%' },
        },
      )
    }, frame)

    // 3-D pointer tilt on interactive frames only.
    let cleanupTilt: (() => void) | undefined
    if (!isTouch() && frame.closest('[data-cursor="hover"]')) {
      const setRX = gsap.quickTo(frame, 'rotationX', { duration: 0.5, ease: 'power2.out' })
      const setRY = gsap.quickTo(frame, 'rotationY', { duration: 0.5, ease: 'power2.out' })
      const onMove = (e: PointerEvent) => {
        const r = frame.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width - 0.5
        const py = (e.clientY - r.top) / r.height - 0.5
        setRY(px * 9)
        setRX(-py * 9)
      }
      const onLeave = () => {
        setRX(0)
        setRY(0)
      }
      frame.addEventListener('pointermove', onMove)
      frame.addEventListener('pointerleave', onLeave)
      cleanupTilt = () => {
        frame.removeEventListener('pointermove', onMove)
        frame.removeEventListener('pointerleave', onLeave)
      }
    }

    return () => {
      ctx.revert()
      cleanupTilt?.()
    }
  }, [showMedia])

  return (
    <div
      ref={ref}
      className={`ph ${rounded ? 'ph--rounded' : ''} ${className}`}
      style={style}
      data-media-id={slot.id}
    >
      {showMedia ? (
        slot.kind === 'video' ? (
          <video
            className="ph__media"
            src={resolvedSrc!}
            autoPlay
            muted
            loop
            playsInline
            preload={eager ? 'auto' : 'metadata'}
            onError={() => setFailed(true)}
          />
        ) : (
          <img
            className="ph__media"
            src={resolvedSrc!}
            alt={slot.label}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => setFailed(true)}
          />
        )
      ) : (
        <div className="ph__stub">
          <span className="ph__grain" aria-hidden="true" />
          <span className="ph__sheen" aria-hidden="true" />
          <span className="ph__corner ph__corner--tl" />
          <span className="ph__corner ph__corner--br" />
          <div className="ph__meta">
            <span className="ph__kind">{slot.kind === 'video' ? '◈ Video' : '◈ Foto'}</span>
            <span className="ph__label">{slot.label}</span>
            <span className="ph__note">{slot.note}</span>
            <span className="ph__await">Foto folgt in Kürze</span>
          </div>
        </div>
      )}
    </div>
  )
}
