import { Heading } from '../components/Heading'
import { useReveal } from '../hooks/useReveal'
import { reservation, contact, footer, site, testimonials, booking } from '../content/site'
import { navigate } from '../lib/useRoute'
import './reservation.css'

/**
 * Kapitel Neun — Reservieren.
 * Das emotionale Finale: das hauseigene Reservierungstool direkt eingebettet,
 * daneben Telefon und E-Mail als persönliche Alternative.
 */
export function Reservation() {
  const headRef = useReveal<HTMLDivElement>({ selector: '[data-reveal]', y: 30 })
  const formRef = useReveal<HTMLDivElement>({ selector: '[data-reveal-f]', y: 26, stagger: 0.08 })
  const voicesRef = useReveal<HTMLDivElement>({ selector: '[data-reveal-v]', y: 30, stagger: 0.1 })
  return (
    <section id="reservation" className="chapter reservation" aria-label="Reservieren">
      <div className="reservation__wrap">
        <div className="reservation__head" ref={headRef}>
          {/* The candle-close — warmth returns after the cool bar, the evening
              comes back to the table where it began. */}
          <span className="reservation__candle" aria-hidden="true" />
          <span className="overline" data-reveal>
            {reservation.overline} — {reservation.chapter}
          </span>
          <Heading text={reservation.headline} as="h2" className="reservation__headline" />
          <p className="lead reservation__sub" data-reveal>
            {reservation.sub}
          </p>
          {/* The table laid — two place settings as hairlines. */}
          <div className="reservation__setting" aria-hidden="true">
            <span />
            <span />
          </div>
        </div>

        <div className="reservation__panel" ref={formRef}>
          {/* Das hauseigene Reservierungstool, direkt eingebettet — der Gast
              bleibt auf der Seite. Der Direktlink darunter ist die Rückfallebene,
              falls ein Browser die Einbettung blockiert. */}
          <div className="reservation__booking" data-reveal-f>
            <iframe
              className="reservation__booking-frame"
              src={booking.url}
              title="Tisch reservieren — Innsider"
              loading="lazy"
              allow="payment"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <p className="reservation__booking-fallback">
              {booking.fallbackNote}{' '}
              <a href={booking.url} target="_blank" rel="noreferrer">
                {booking.openLabel} ↗
              </a>
            </p>
          </div>

          <aside className="reservation__aside">
            <div className="reservation__direct">
              <span className="reservation__block-title">{reservation.direct.heading}</span>
              <p className="reservation__direct-note">{reservation.direct.note}</p>
              <div className="reservation__direct-actions">
                <a className="btn btn--gold" href={contact.phoneHref}>
                  <span className="btn__ico" aria-hidden="true">☎</span>
                  {reservation.direct.callCta}
                </a>
                <a className="btn btn--ghost" href={contact.emailReserveHref}>
                  {reservation.direct.mailCta}
                  <span className="btn__arrow">→</span>
                </a>
              </div>
              <a className="reservation__direct-phone" href={contact.phoneHref}>
                {contact.phone}
              </a>
            </div>

            <div className="reservation__block">
              <span className="reservation__block-title">So finden Sie uns</span>
              <p>
                {contact.address.street}
                <br />
                {contact.address.postal} {contact.address.city}, {contact.address.country}
              </p>
            </div>
            <div className="reservation__block">
              <span className="reservation__block-title">Kontakt</span>
              <p>
                <a href={contact.phoneHref}>{contact.phone}</a>
                <br />
                <a href={contact.emailHref}>{contact.email}</a>
              </p>
            </div>
            <div className="reservation__block">
              <span className="reservation__block-title">Öffnungszeiten</span>
              <p>{reservation.hoursNote}</p>
            </div>
          </aside>
        </div>

        {/* Echte Google-Bewertungen */}
        <div className="reservation__voices" ref={voicesRef}>
          <div className="reservation__voices-head" data-reveal-v>
            <span className="overline">{testimonials.overline}</span>
            <span className="reservation__voices-count">{testimonials.count}</span>
          </div>
          <div className="reservation__voices-grid">
            {testimonials.items.map((t) => (
              <figure className="reservation__voice" key={t.author} data-reveal-v>
                <blockquote>„{t.text}"</blockquote>
                <figcaption>{t.author}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>

      <footer className="reservation__footer">
        <div className="reservation__footer-inner">
          <span className="reservation__footer-mark">{site.wordmark}</span>
          <p className="reservation__footer-line">{footer.line}</p>
          <div className="reservation__footer-meta">
            <button type="button" onClick={() => navigate('impressum')} data-cursor="hover">
              Impressum
            </button>
            <button type="button" onClick={() => navigate('agb')} data-cursor="hover">
              AGB
            </button>
            <button type="button" onClick={() => navigate('datenschutz')} data-cursor="hover">
              Datenschutz
            </button>
            <a href={contact.instagramHref} target="_blank" rel="noreferrer">
              {contact.instagram}
            </a>
            <span>{footer.credit}</span>
          </div>
        </div>
        <p className="reservation__footer-by">
          {footer.by.prefix}{' '}
          <a href={footer.by.href} target="_blank" rel="noreferrer" data-cursor="hover">
            {footer.by.name}
          </a>{' '}
          {footer.by.suffix}
        </p>
      </footer>
    </section>
  )
}
