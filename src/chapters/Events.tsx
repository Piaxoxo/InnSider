import { Heading } from '../components/Heading'
import { Placeholder } from '../components/Placeholder'
import { useReveal } from '../hooks/useReveal'
import { scrollToId } from '../lib/scroll'
import { events } from '../content/site'
import { media } from '../content/assets'
import './events.css'

/**
 * Chapter Eight — Occasions.
 * The evenings that deserve the whole room. An editorial header over a wide
 * private-room frame, then the occasions as a warm, hover-lifting list.
 */
export function Events() {
  const headRef = useReveal<HTMLDivElement>({ selector: '[data-reveal]', y: 28 })
  const listRef = useReveal<HTMLDivElement>({ selector: '.events__card', y: 40, stagger: 0.1 })

  return (
    <section id="events" className="chapter events" aria-label="Occasions — private events">
      <div className="events__wrap">
        <div className="events__hero">
          <div className="events__hero-media">
            <Placeholder slot={media.eventsRoom} rounded={false} />
            <span className="events__hero-veil" aria-hidden="true" />
          </div>
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
          {events.cards.map((c) => (
            <article className="events__card" key={c.title} data-cursor="hover">
              <h3 className="events__card-title">{c.title}</h3>
              <p className="events__card-body">{c.body}</p>
              <span className="events__card-line" aria-hidden="true" />
            </article>
          ))}
        </div>

        <div className="events__cta">
          <p className="events__cta-text">Tell us what you’re celebrating.</p>
          <button className="btn btn--gold" onClick={() => scrollToId('reservation')}>
            {events.cta}
            <span className="btn__arrow">→</span>
          </button>
        </div>
      </div>
    </section>
  )
}
