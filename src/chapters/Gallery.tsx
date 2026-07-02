import { useEffect, useRef } from 'react'
import { gsap } from '../lib/scroll'
import { prefersReducedMotion } from '../lib/useReducedMotion'
import { Heading } from '../components/Heading'
import { Placeholder } from '../components/Placeholder'
import { PhotoWall } from '../components/PhotoWall'
import { useReveal } from '../hooks/useReveal'
import { gallery } from '../content/site'
import { media } from '../content/assets'
import { pools } from '../content/pools'
import './gallery.css'

const frameSlots = [media.room1, media.room2, media.room3, media.room4, media.room5, media.room6]
const wallCaptions = gallery.frames.map((f) => ({ title: f.title, story: f.story }))

/**
 * Chapter Seven — The Rooms.
 * Not a grid gallery — an exhibition. Asymmetric frames drift at different
 * speeds as you scroll (depth), and each reveals its story on hover. Walk the
 * room the way a guest does.
 */
export function Gallery() {
  const root = useRef<HTMLElement>(null)
  const headRef = useReveal<HTMLDivElement>({ selector: '[data-reveal]', y: 28 })

  useEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>('.gallery__frame').forEach((frame) => {
        const speed = parseFloat(frame.dataset.speed || '0')
        gsap.fromTo(
          frame,
          { yPercent: speed * 8 },
          {
            yPercent: speed * -8,
            ease: 'none',
            scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section id="gallery" ref={root} className="chapter gallery" aria-label="The rooms">
      <div className="gallery__head" ref={headRef}>
        <div className="gallery__head-top" data-reveal>
          <span className="overline">{gallery.overline}</span>
          <span className="chapter-index">{gallery.chapter}</span>
        </div>
        <Heading text={gallery.headline} className="gallery__headline" />
        <p className="lead gallery__intro" data-reveal>
          {gallery.intro}
        </p>
      </div>

      {/* Auto-scaling wall when interiors are dropped into src/media/rooms/;
          otherwise the curated placeholder exhibition. */}
      {pools.rooms.length > 0 ? (
        <PhotoWall images={pools.rooms} captions={wallCaptions} />
      ) : (
        <div className="gallery__exhibit">
          {gallery.frames.map((f, i) => (
            <figure
              key={f.title}
              className={`gallery__frame gallery__frame--${i + 1}`}
              data-speed={[1.4, 0.6, 1, 0.4, 1.2, 0.7][i]}
              data-cursor="hover"
            >
              <Placeholder slot={frameSlots[i]} />
              <figcaption className="gallery__caption">
                <span className="gallery__caption-title">{f.title}</span>
                <span className="gallery__caption-story">{f.story}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  )
}
