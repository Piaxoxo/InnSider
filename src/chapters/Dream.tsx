import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/scroll'
import { prefersReducedMotion } from '../lib/useReducedMotion'
import { Heading } from '../components/Heading'
import { Placeholder } from '../components/Placeholder'
import { useReveal } from '../hooks/useReveal'
import { dream } from '../content/site'
import { media } from '../content/assets'
import './dream.css'

/**
 * Chapter Two — The Dream.
 * Alice's story, told beside a room that literally builds itself: as the guest
 * scrolls, material layers (sketch, stone, walnut, light) peel away to reveal
 * the finished space, and the stage label advances in step. It's the idea in
 * her head becoming the room you can walk into.
 */
export function Dream() {
  const root = useRef<HTMLElement>(null)
  const [stage, setStage] = useState(0)
  const textRef = useReveal<HTMLDivElement>({ selector: '[data-reveal]', y: 30 })

  useEffect(() => {
    const el = root.current
    if (!el) return
    const layers = el.querySelectorAll<HTMLElement>('.dream__layer')
    const stages = dream.buildLabels.length

    if (prefersReducedMotion()) {
      gsap.set(layers, { autoAlpha: 0 })
      setStage(stages - 1)
      return
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.dream__visual',
          start: 'top 70%',
          end: 'bottom 60%',
          scrub: 0.6,
          onUpdate: (self) => setStage(Math.min(stages - 1, Math.floor(self.progress * stages))),
        },
      })
      // Peel each material layer away in sequence.
      layers.forEach((layer, i) => {
        tl.to(layer, { autoAlpha: 0, yPercent: -6, scale: 1.04, ease: 'power2.inOut' }, i * 0.8)
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section id="dream" ref={root} className="chapter dream" aria-label="The dream — Alice Kern">
      <div className="dream__grid">
        {/* Sticky visual — the room assembling. */}
        <div className="dream__visual">
          <div className="dream__frame">
            <Placeholder slot={media.aliceRoom} className="dream__room" />
            {/* Material layers that peel away, revealing the finished room. */}
            <div className="dream__layer dream__layer--sketch" aria-hidden="true">
              <span>Sketch</span>
            </div>
            <div className="dream__layer dream__layer--stone" aria-hidden="true">
              <span>Stone</span>
            </div>
            <div className="dream__layer dream__layer--walnut" aria-hidden="true">
              <span>Walnut</span>
            </div>
            <div className="dream__layer dream__layer--light" aria-hidden="true" />
          </div>

          <ol className="dream__stages" aria-hidden="true">
            {dream.buildLabels.map((label, i) => (
              <li key={label} className={i === stage ? 'is-active' : i < stage ? 'is-done' : ''}>
                <span className="dream__stage-tick" />
                {label}
              </li>
            ))}
          </ol>
        </div>

        {/* The story. */}
        <div className="dream__story" ref={textRef}>
          <div className="dream__head" data-reveal>
            <span className="overline">{dream.overline}</span>
            <span className="chapter-index">{dream.chapter}</span>
          </div>

          <p className="kicker" data-reveal>
            {dream.kicker}
          </p>

          <Heading text={dream.headline} className="dream__headline" />

          <div className="dream__body">
            {dream.paragraphs.map((p, i) => (
              <p className="body" data-reveal key={i}>
                {p}
              </p>
            ))}
          </div>

          <figure className="dream__quote" data-reveal>
            <blockquote>“{dream.pullQuote}”</blockquote>
            <figcaption>{dream.attribution}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
