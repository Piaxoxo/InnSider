import { useRef, useState, type CSSProperties } from 'react'
import type { MediaSlot } from '../content/assets'
import './placeholder.css'

/**
 * Premium media slot. Renders the real asset once `slot.src` is delivered;
 * until then (or if the file isn't on disk yet) it draws a warm, art-directed
 * placeholder that:
 *   • reserves the exact aspect ratio (so nothing reflows when the real asset
 *     drops in and no animation timing changes),
 *   • states the shot brief and whether it's photo or film,
 *   • has a living brass shimmer so the layout never looks "empty".
 *
 * A slot may declare its `src` ahead of the file actually existing (pre-wiring):
 * if the image/video fails to load, we fall back to the placeholder instead of
 * showing a broken frame. So `src` can be set the moment the filename is known,
 * and the frame lights up automatically once the file lands in /public/media/.
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
  // If a pre-wired asset 404s (not delivered yet), gracefully show the stub.
  const [failed, setFailed] = useState(false)
  const showMedia = !!slot.src && !failed
  // Resolve public/media paths against the deploy base (root on Vercel,
  // /innsider/ on GitHub project Pages) so the same src works either place.
  const resolvedSrc =
    slot.src && slot.src.startsWith('/') ? import.meta.env.BASE_URL + slot.src.slice(1) : slot.src

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
