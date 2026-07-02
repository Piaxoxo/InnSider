import { useRef, type CSSProperties } from 'react'
import type { MediaSlot } from '../content/assets'
import './placeholder.css'

/**
 * Premium media slot. Renders the real asset once `slot.src` is delivered;
 * until then it draws a warm, art-directed placeholder that:
 *   • reserves the exact aspect ratio (so nothing reflows when the real asset
 *     drops in and no animation timing changes),
 *   • states the shot brief and whether it's photo or film,
 *   • has a living brass shimmer so the layout never looks "empty".
 *
 * Drop a file at `slot.src` (see content/assets.ts) to go live — no code change
 * to any chapter is required.
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

  return (
    <div
      ref={ref}
      className={`ph ${rounded ? 'ph--rounded' : ''} ${className}`}
      style={style}
      data-media-id={slot.id}
    >
      {slot.src ? (
        slot.kind === 'video' ? (
          <video
            className="ph__media"
            src={slot.src}
            autoPlay
            muted
            loop
            playsInline
            preload={eager ? 'auto' : 'metadata'}
          />
        ) : (
          <img
            className="ph__media"
            src={slot.src}
            alt={slot.label}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
          />
        )
      ) : (
        <div className="ph__stub">
          <span className="ph__grain" aria-hidden="true" />
          <span className="ph__sheen" aria-hidden="true" />
          <span className="ph__corner ph__corner--tl" />
          <span className="ph__corner ph__corner--br" />
          <div className="ph__meta">
            <span className="ph__kind">{slot.kind === 'video' ? '◈ Film' : '◈ Photograph'}</span>
            <span className="ph__label">{slot.label}</span>
            <span className="ph__note">{slot.note}</span>
            <span className="ph__await">Premium asset to be delivered</span>
          </div>
        </div>
      )}
    </div>
  )
}
