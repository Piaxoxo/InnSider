import { useEffect, useRef } from 'react'
import { Heading } from '../components/Heading'
import { Placeholder } from '../components/Placeholder'
import { PhotoWall } from '../components/PhotoWall'
import { useReveal } from '../hooks/useReveal'
import { gsap, scrollToId } from '../lib/scroll'
import { prefersReducedMotion } from '../lib/useReducedMotion'
import { events } from '../content/site'
import { media } from '../content/assets'
import { pools } from '../content/pools'
import './events.css'

/**
 * Chapter Eight — Occasions.
 * The evenings that deserve the whole room. An editorial header over a wide
 * private-room frame, the occasions as a warm list, then an auto-scaling wall
 * of real celebration moments (drop any number into src/media/moments/).
 */
// Curated fallback collage shown until the moments pool has photos.
const fallbackMoments = [
  media.eventGathering,
  media.eventChampagne,
  media.eventWelcome,
  media.eventEmbrace,
  media.eventDinner,
]

// Evocative captions cycled across however many moment photos exist.
const momentCaptions = [
  { title: 'The table, full', story: 'The room at its warmest.' },
  { title: 'To celebrate', story: 'Every occasion deserves a toast.' },
  { title: 'Arrivals', story: 'Coats still on, first hellos.' },
  { title: 'Reunions', story: 'The reason people come back.' },
  { title: 'Deep in the evening', story: 'Conversation leaning in.' },
  { title: 'The last dance', story: 'Nobody checking the time.' },
]

export function Events() {
  const root = useRef<HTMLElement>(null)
  const headRef = useReveal<HTMLDivElement>({ selector: '[data-reveal]', y: 28 })
  const listRef = useReveal<HTMLDivElement>({ selector: '.events__card', y: 40, stagger: 0.1 })
  const momentsRef = useReveal<HTMLDivElement>({ selector: '.events__moment', y: 44, stagger: 0.1 })

  // Signature: the evening begins. The room lies in dusk, then the lights come
  // up as the guest scrolls — the photo warms and opens before the copy lands.
  useEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.events__hero-media',
        { filter: 'brightness(0.4) saturate(0.6)', scale: 1.08 },
        {
          filter: 'brightness(1) saturate(1)',
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.events__hero', start: 'top 90%', end: 'center 55%', scrub: 0.8 },
        },
      )
      gsap.fromTo(
        '.events__lamp',
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 1.1,
          ease: 'power2.out',
          stagger: 0.22,
          scrollTrigger: { trigger: '.events__hero', start: 'top 70%' },
        },
      )
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section id="events" ref={root} className="chapter events" aria-label="Occasions — private events">
      <div className="events__wrap">
        <div className="events__hero">
          <div className="events__hero-media">
            <Placeholder slot={media.eventsRoom} rounded={false} />
          </div>
          {/* Warm lamps blooming one after another as the room wakes */}
          <div className="events__lamps" aria-hidden="true">
            <span className="events__lamp" style={{ left: '22%', top: '34%' }} />
            <span className="events__lamp" style={{ left: '48%', top: '28%' }} />
            <span className="events__lamp" style={{ left: '71%', top: '36%' }} />
          </div>
          <span className="events__hero-veil" aria-hidden="true" />
          <div className="events__head" ref={headRef}>
            <span className="overline" data-reveal>
              {events.overline} — {events.chapter}
            </span>
            <Heading text={events.headline} className="events__headline" />
            <p className="lead events__intro" data-reveal>
              {events.intro}
            </p>
          </div>
        </div>

        <div className="events__cards" ref={listRef}>
          {events.cards.map((c, i) => (
            <article className={`events__card events__card--${i + 1}`} key={c.title} data-cursor="hover">
              <span className="events__card-n meta" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="events__card-title">{c.title}</h3>
              <p className="events__card-body">{c.body}</p>
              <span className="events__card-line" aria-hidden="true" />
            </article>
          ))}
        </div>

        {/* Real celebration moments — auto-scaling wall when photos are dropped
            into src/media/moments/; otherwise the curated collage. */}
        {pools.moments.length > 0 ? (
          <PhotoWall images={pools.moments} captions={momentCaptions} className="events__wall" />
        ) : (
          <div className="events__moments" ref={momentsRef}>
            {fallbackMoments.map((m, i) => (
              <figure className={`events__moment events__moment--${i + 1}`} key={m.id} data-cursor="hover">
                <Placeholder slot={m} />
                <figcaption>{m.label}</figcaption>
              </figure>
            ))}
          </div>
        )}

        <div className="events__cta">
          <p className="events__cta-text">Erzählen Sie uns von Ihrem Anlass.</p>
          <button className="btn btn--gold" onClick={() => scrollToId('reservation')}>
            {events.cta}
            <span className="btn__arrow">→</span>
          </button>
        </div>
      </div>
    </section>
  )
}
