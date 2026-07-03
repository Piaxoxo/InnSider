import { useEffect, useRef } from 'react'
import { gsap } from '../lib/scroll'
import { prefersReducedMotion } from '../lib/useReducedMotion'
import { Heading } from '../components/Heading'
import { Placeholder } from '../components/Placeholder'
import { useReveal } from '../hooks/useReveal'
import { kitchen } from '../content/site'
import { media } from '../content/assets'
import './kitchen.css'

/**
 * Chapter Three — The Heart of the Kitchen.
 * The emotional peak. Chef Stefan as the heart to Alice's soul. A tall portrait
 * that parallaxes against the scroll, his philosophy laid out as three tenets,
 * and a full-bleed pull quote. Trust him before you taste anything.
 */
export function Kitchen() {
  const root = useRef<HTMLElement>(null)
  const headRef = useReveal<HTMLDivElement>({ selector: '[data-reveal]', y: 30 })
  const philoRef = useReveal<HTMLDivElement>({ selector: '.kitchen__tenet', y: 44, stagger: 0.14 })

  // Portrait parallax + slow scale on the macro frame.
  useEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.to('.kitchen__portrait-media', {
        yPercent: -14,
        ease: 'none',
        scrollTrigger: { trigger: '.kitchen__portrait', start: 'top bottom', end: 'bottom top', scrub: true },
      })
      gsap.fromTo(
        '.kitchen__hands-media',
        { scale: 1.15 },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.kitchen__hands', start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section id="kitchen" ref={root} className="chapter kitchen" aria-label="The kitchen — Chef Stefan">
      <div className="kitchen__wrap">
        <div className="kitchen__head" ref={headRef}>
          <div className="kitchen__head-top" data-reveal>
            <span className="overline">{kitchen.overline}</span>
            <span className="chapter-index">{kitchen.chapter}</span>
          </div>
          <p className="kicker" data-reveal>
            {kitchen.kicker}
          </p>
          <Heading text={kitchen.headline} className="kitchen__headline" />
        </div>

        <div className="kitchen__lead">
          <div className="kitchen__portrait">
            <div className="kitchen__portrait-media">
              <Placeholder slot={media.stefanPortrait} />
            </div>
          </div>
          <div className="kitchen__story">
            {kitchen.paragraphs.map((p, i) => (
              <p className="body" key={i}>
                {p}
              </p>
            ))}
          </div>
        </div>

        <div className="kitchen__philosophy" ref={philoRef}>
          {kitchen.philosophy.map((t) => (
            <article className="kitchen__tenet" key={t.n}>
              <span className="kitchen__tenet-n">{t.n}</span>
              <h3 className="kitchen__tenet-title">{t.title}</h3>
              <p className="kitchen__tenet-body">{t.body}</p>
            </article>
          ))}
        </div>
      </div>

      <figure className="kitchen__quote">
        <blockquote>“{kitchen.pullQuote}”</blockquote>
        <figcaption>{kitchen.attribution}</figcaption>
      </figure>

      <div className="kitchen__media">
        <div className="kitchen__motion">
          <Placeholder slot={media.dishBeet2} />
        </div>
        <div className="kitchen__hands">
          <div className="kitchen__hands-media">
            <Placeholder slot={media.stefanHands} />
          </div>
        </div>
      </div>
    </section>
  )
}
