import { Heading } from '../components/Heading'
import { Placeholder } from '../components/Placeholder'
import { PhotoWall } from '../components/PhotoWall'
import { useReveal } from '../hooks/useReveal'
import { scrollToId } from '../lib/scroll'
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
  const headRef = useReveal<HTMLDivElement>({ selector: '[data-reveal]', y: 28 })
  const listRef = useReveal<HTMLDivElement>({ selector: '.events__card', y: 40, stagger: 0.1 })
  const momentsRef = useReveal<HTMLDivElement>({ selector: '.events__moment', y: 44, stagger: 0.1 })

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
