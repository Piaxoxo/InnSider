import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, startScroll, stopScroll } from '../lib/scroll'
import { prefersReducedMotion, isTouch } from '../lib/useReducedMotion'
import { Heading } from '../components/Heading'
import { PhotoWall } from '../components/PhotoWall'
import { WorldGallery } from '../three/WorldGallery'
import { useReveal } from '../hooks/useReveal'
import { gallery } from '../content/site'
import { memories, type Memory } from '../content/memories'
import './gallery.css'

const wallImages = memories.map((m) => ({ src: m.url, name: m.caption }))
const wallCaptions = memories.map((m) => ({ title: m.caption, story: m.category }))

/**
 * Kapitel Sieben — die Memory Gallery.
 * On capable devices the room becomes a flythrough of every delivered photo,
 * grouped into six rooms of memory. The live category updates as you move; a
 * hovered slab surfaces its caption; clicking opens a cinematic focus view.
 * Touch / reduced-motion fall back to the curated 2-D exhibition of the same
 * photos, so everyone still gets the photography.
 */
export function Gallery() {
  const root = useRef<HTMLElement>(null)
  const overlay = useRef<HTMLDivElement>(null)
  const catRef = useRef<HTMLElement>(null)
  const headRef = useReveal<HTMLDivElement>({ selector: '[data-reveal]', y: 28 })
  const progress = useRef({ v: 0 })
  const [hovered, setHovered] = useState<Memory | null>(null)
  const [focused, setFocused] = useState<Memory | null>(null)
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

  // Focus view: hold the flythrough still and let Escape close it.
  const openFocus = (m: Memory) => {
    setFocused(m)
    setHovered(null)
    document.body.style.cursor = ''
    stopScroll()
  }
  const closeFocus = () => {
    setFocused(null)
    startScroll()
  }
  useEffect(() => {
    if (!focused) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeFocus()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focused])

  if (immersive) {
    return (
      <section
        id="gallery"
        ref={root}
        className="chapter gallery gallery--world"
        aria-label="Erinnerungen"
        style={{ height: `${memories.length * 26 + 160}vh` }}
      >
        <div className="worldg__sticky">
          <div className="worldg__canvas">
            <WorldGallery
              progressRef={progress.current}
              lowPerf={lowPerf}
              catRef={catRef}
              onHover={setHovered}
              onSelect={openFocus}
            />
          </div>

          <div className="worldg__overlay" ref={overlay}>
            <span className="overline">{gallery.overline}</span>
            <Heading text={gallery.headline} className="worldg__headline" />
            <p className="lead worldg__intro">{gallery.intro}</p>
            <span className="worldg__hint">Fliegen Sie durch die Erinnerungen ↓</span>
          </div>

          {/* Live category readout — updated imperatively by the rig */}
          <span className="worldg__category" ref={catRef} aria-hidden="true" />

          {/* Hovered caption */}
          <div className={`worldg__caption ${hovered ? 'is-on' : ''}`} aria-hidden={!hovered}>
            {hovered && (
              <>
                <span className="worldg__caption-cat">{hovered.category}</span>
                <span className="worldg__caption-text">{hovered.caption}</span>
                <span className="worldg__caption-hint">Klicken zum Vergrößern</span>
              </>
            )}
          </div>
        </div>

        {/* Cinematic focus view */}
        {focused && (
          <div className="worldg__focus" role="dialog" aria-modal="true" onClick={closeFocus}>
            <button className="worldg__focus-close" onClick={closeFocus} aria-label="Schließen">
              ✕
            </button>
            <figure className="worldg__focus-figure" onClick={(e) => e.stopPropagation()}>
              <img src={focused.url} alt={focused.caption} />
              <figcaption>
                <span className="worldg__focus-cat">{focused.category}</span>
                <span className="worldg__focus-text">{focused.caption}</span>
              </figcaption>
            </figure>
          </div>
        )}
      </section>
    )
  }

  // Fallback (touch / reduced motion): curated 2-D exhibition of the same photos.
  return (
    <section id="gallery" ref={root} className="chapter gallery" aria-label="Erinnerungen">
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

      <PhotoWall images={wallImages} captions={wallCaptions} />
    </section>
  )
}
