import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/useReducedMotion'
import './craft-video.css'

/**
 * A silent, looping craft clip — the house at work.
 *
 * Plays only while it is actually on screen (IntersectionObserver), so an
 * off-screen video never costs decode time or battery. A poster frame paints
 * instantly, so the frame is never empty while the file loads. Under reduced
 * motion the poster simply stands as a still photograph.
 */
export function CraftVideo({
  src,
  poster,
  caption,
  className = '',
}: {
  src: string
  poster: string
  caption?: string
  className?: string
}) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = ref.current
    if (!v || prefersReducedMotion()) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) v.play().catch(() => {})
        else v.pause()
      },
      { rootMargin: '120px' },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  const base = import.meta.env.BASE_URL

  return (
    <figure className={`craftv ${className}`}>
      <video
        ref={ref}
        className="craftv__media"
        src={`${base}${src}`}
        poster={`${base}${poster}`}
        muted
        loop
        playsInline
        preload="none"
      />
      <span className="craftv__grain" aria-hidden="true" />
      {caption && <figcaption className="craftv__caption">{caption}</figcaption>}
    </figure>
  )
}
