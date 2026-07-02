import type { PoolImage } from '../content/pools'
import { useReveal } from '../hooks/useReveal'
import './photowall.css'

export interface WallCaption {
  title: string
  story?: string
}

/**
 * Auto-scaling masonry photo wall. Renders however many images a pool contains
 * — 3 or 50 — in a column masonry that naturally accommodates mixed portrait
 * and landscape shots. Captions (optional) are cycled across the images, so the
 * wall stays editorial no matter how many photos are dropped in.
 *
 * Real, delivered files only: this renders <img> for images that exist in the
 * pool, so there are never broken frames. Empty pool → renders nothing (the
 * caller supplies a curated placeholder fallback).
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
  const ref = useReveal<HTMLDivElement>({ selector: '.wall__frame', y: 40, stagger: 0.06 })
  if (!images.length) return null

  return (
    <div className={`wall ${className}`} ref={ref}>
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
