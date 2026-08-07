import { useEffect, useRef } from 'react'
import { Heading } from '../components/Heading'
import { Placeholder } from '../components/Placeholder'
import { useReveal } from '../hooks/useReveal'
import { gsap } from '../lib/scroll'
import { prefersReducedMotion } from '../lib/useReducedMotion'
import { bar } from '../content/site'
import { media } from '../content/assets'
import './bar.css'

/**
 * Chapter Five — The Bar.
 * The room changes key: darker, slower, gold on black. Signature drinks are
 * treated as artworks — cards that catch the light and lift on hover, over a
 * real scene of the bar after dark, with a portrait of the room in good hands.
 */
export function Bar() {
  const root = useRef<HTMLElement>(null)
  const headRef = useReveal<HTMLDivElement>({ selector: '[data-reveal]', y: 28 })
  const cardsRef = useReveal<HTMLDivElement>({ selector: '.bar__card', y: 50, stagger: 0.12 })
  const glassRef = useReveal<HTMLDivElement>({ selector: '.bar__glass-item', y: 44, stagger: 0.15 })

  // Signature: the glass fills. An amber level rises behind the drinks list
  // while each entry lights in turn — bottles coming up on the back bar.
  useEffect(() => {
    const el = root.current
    if (!el) return
    const cards = el.querySelectorAll<HTMLElement>('.bar__card')
    if (prefersReducedMotion()) {
      cards.forEach((c) => c.classList.add('is-lit'))
      return
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.bar__level',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.bar__cards', start: 'top 88%', end: 'bottom 55%', scrub: true },
        },
      )
      cards.forEach((card, i) => {
        gsap.to(card, {
          scrollTrigger: {
            trigger: card,
            start: `top ${82 - i * 2}%`,
            onEnter: () => card.classList.add('is-lit'),
            onLeaveBack: () => card.classList.remove('is-lit'),
          },
        })
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section id="bar" ref={root} className="chapter bar" aria-label="The bar">
      <div className="bar__motion">
        <Placeholder slot={media.barScene} rounded={false} />
        <span className="bar__motion-veil" aria-hidden="true" />
      </div>
      {/* Blue-hour grade: the room changes key — cool light, gold drinks against it */}
      <span className="bar__grade" aria-hidden="true" />
      <span className="bar__reflect" aria-hidden="true" />

      <div className="bar__wrap">
        <div className="bar__top">
          <div className="bar__head" ref={headRef}>
            <div className="bar__head-top" data-reveal>
              <span className="overline">{bar.overline}</span>
              <span className="chapter-index">{bar.chapter}</span>
            </div>
            <Heading text={bar.headline} className="bar__headline" />
            <p className="lead bar__intro" data-reveal>
              {bar.intro}
            </p>
          </div>

          <figure className="bar__portrait">
            <Placeholder slot={media.barServer} />
            <figcaption>Das Lokal in guten Händen.</figcaption>
          </figure>
        </div>

        <div className="bar__cards" ref={cardsRef}>
          <span className="bar__level" aria-hidden="true" />
          {bar.drinks.map((d, i) => (
            <article className="bar__card" key={d.name} data-cursor="hover">
              <span className="bar__card-sheen" aria-hidden="true" />
              <span className="bar__card-index">0{i + 1}</span>
              <div className="bar__card-body">
                <h3 className="bar__card-name">{d.name}</h3>
                <p className="bar__card-base">{d.base}</p>
              </div>
              <span className="bar__card-mood">{d.mood}</span>
            </article>
          ))}
        </div>

        {/* Cocktails in the glass — the spritz and a golden-hour guest. */}
        <div className="bar__glass" ref={glassRef}>
          <figure className="bar__glass-item bar__glass-item--drink" data-cursor="hover">
            <Placeholder slot={media.cocktailAperol} />
            <figcaption>{media.cocktailAperol.label}</figcaption>
          </figure>
          <figure className="bar__glass-item bar__glass-item--guest" data-cursor="hover">
            <Placeholder slot={media.barGuest} />
            <figcaption>{media.barGuest.label}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
