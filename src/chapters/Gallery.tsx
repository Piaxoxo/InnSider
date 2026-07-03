import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/scroll'
import { prefersReducedMotion, isTouch } from '../lib/useReducedMotion'
import { Heading } from '../components/Heading'
import { Placeholder } from '../components/Placeholder'
import { PhotoWall } from '../components/PhotoWall'
import { WorldGallery } from '../three/WorldGallery'
import { useReveal } from '../hooks/useReveal'
import { gallery } from '../content/site'
import { media } from '../content/assets'
import { pools } from '../content/pools'
import './gallery.css'

const frameSlots = [media.room1, media.room2, media.room3, media.room4, media.room5, media.room6]
const wallCaptions = gallery.frames.map((f) => ({ title: f.title, story: f.story }))

/**
 * Kapitel Sieben — Location.
 * Stage 1 of the 3-D scroll-world: on capable devices the room becomes a
 * flythrough — the camera flies through the real photos floating in space as
 * you scroll. Touch / reduced-motion fall back to the curated 2-D exhibition,
 * so everyone still gets the photography.
 */
export function Gallery() {
  const root = useRef<HTMLElement>(null)
  const overlay = useRef<HTMLDivElement>(null)
  const headRef = useReveal<HTMLDivElement>({ selector: '[data-reveal]', y: 28 })
  const progress = useRef({ v: 0 })
  // The 3-D flythrough now runs on phones too; only reduced-motion falls back.
  const immersive = !prefersReducedMotion()
  const lowPerf = isTouch()

  // Drive the flythrough from the section's scroll progress (Lenis-synced),
  // and fade the editorial overlay out so the finale stands clean full-screen.
  useEffect(() => {
    if (!immersive) return
    const el = root.current
    if (!el) return
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        progress.current.v = self.progress
        if (overlay.current) {
          const fade = 1 - gsap.utils.clamp(0, 1, (self.progress - 0.72) / 0.2)
          overlay.current.style.opacity = String(fade)
        }
      },
    })
    return () => st.kill()
  }, [immersive])

  if (immersive) {
    return (
      <section id="gallery" ref={root} className="chapter gallery gallery--world" aria-label="Location">
        <div className="worldg__sticky">
          <div className="worldg__canvas">
            <WorldGallery progressRef={progress.current} lowPerf={lowPerf} />
          </div>
          <div className="worldg__overlay" ref={overlay}>
            <span className="overline">{gallery.overline}</span>
            <Heading text={gallery.headline} className="worldg__headline" />
            <p className="lead worldg__intro">{gallery.intro}</p>
            <span className="worldg__hint">Scrollen, um durch die Räume zu fliegen ↓</span>
          </div>
        </div>
      </section>
    )
  }

  // Fallback (touch / reduced motion): curated 2-D exhibition.
  return (
    <section id="gallery" ref={root} className="chapter gallery" aria-label="Location">
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

      {pools.rooms.length > 0 ? (
        <PhotoWall images={pools.rooms} captions={wallCaptions} />
      ) : (
        <div className="gallery__exhibit">
          {gallery.frames.map((f, i) => (
            <figure key={f.title} className={`gallery__frame gallery__frame--${i + 1}`} data-cursor="hover">
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

// keep gsap import used for side-effect registration ordering
void gsap
