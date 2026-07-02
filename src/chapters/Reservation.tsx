import { useRef, useState, type FormEvent } from 'react'
import { Heading } from '../components/Heading'
import { useReveal } from '../hooks/useReveal'
import { reservation, contact, hours, footer, site } from '../content/site'
import './reservation.css'

/**
 * Chapter Nine — Reservation.
 * The emotional finale. One confident sentence, a minimal form, and the room's
 * essentials. With no booking backend yet, the form composes a personal email
 * to the house (mailto) — trivially swapped for a real endpoint later — and
 * shows a warm confirmation in place.
 */
export function Reservation() {
  const headRef = useReveal<HTMLDivElement>({ selector: '[data-reveal]', y: 30 })
  const formRef = useReveal<HTMLDivElement>({ selector: '[data-reveal-f]', y: 26, stagger: 0.08 })
  const [sent, setSent] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const name = String(data.get('name') || '')
    const body = [
      `Name: ${name}`,
      `Email: ${data.get('email') || ''}`,
      `Date: ${data.get('date') || ''}`,
      `Guests: ${data.get('guests') || ''}`,
      `Occasion: ${data.get('occasion') || '—'}`,
    ].join('\n')
    // Compose a personal request to the house.
    window.location.href = `${contact.emailHref}?subject=${encodeURIComponent(
      `Reservation request — ${name}`,
    )}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  return (
    <section id="reservation" className="chapter reservation" aria-label="Reserve">
      <div className="reservation__wrap">
        <div className="reservation__head" ref={headRef}>
          <span className="overline" data-reveal>
            {reservation.overline} — {reservation.chapter}
          </span>
          <Heading text={reservation.headline} as="h2" className="reservation__headline" />
          <p className="lead reservation__sub" data-reveal>
            {reservation.sub}
          </p>
        </div>

        <div className="reservation__panel" ref={formRef}>
          {!sent ? (
            <form className="reservation__form" onSubmit={onSubmit}>
              <div className="reservation__field reservation__field--wide" data-reveal-f>
                <label htmlFor="r-name">{reservation.fields.name}</label>
                <input id="r-name" name="name" ref={nameRef} required autoComplete="name" />
              </div>
              <div className="reservation__field" data-reveal-f>
                <label htmlFor="r-email">{reservation.fields.email}</label>
                <input id="r-email" name="email" type="email" required autoComplete="email" />
              </div>
              <div className="reservation__field" data-reveal-f>
                <label htmlFor="r-date">{reservation.fields.date}</label>
                <input id="r-date" name="date" type="date" required />
              </div>
              <div className="reservation__field" data-reveal-f>
                <label htmlFor="r-guests">{reservation.fields.guests}</label>
                <select id="r-guests" name="guests" defaultValue="2">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'guest' : 'guests'}
                    </option>
                  ))}
                  <option value="12+">12+ (private)</option>
                </select>
              </div>
              <div className="reservation__field reservation__field--wide" data-reveal-f>
                <label htmlFor="r-occasion">{reservation.fields.occasion}</label>
                <input id="r-occasion" name="occasion" autoComplete="off" />
              </div>
              <div className="reservation__submit" data-reveal-f>
                <button className="btn btn--gold" type="submit">
                  {reservation.cta}
                  <span className="btn__arrow">→</span>
                </button>
                <span className="reservation__reassure">{reservation.reassurance}</span>
              </div>
            </form>
          ) : (
            <div className="reservation__confirm" role="status">
              <span className="reservation__confirm-mark">✦</span>
              <h3>Your request is on its way.</h3>
              <p>
                We reply to every request personally, usually within the day. If your email client
                didn’t open, write to us directly at{' '}
                <a href={contact.emailHref}>{contact.email}</a>.
              </p>
            </div>
          )}

          <aside className="reservation__aside">
            <div className="reservation__block">
              <span className="reservation__block-title">Find us</span>
              <p>
                {contact.address.street}
                <br />
                {contact.address.postal} {contact.address.city}, {contact.address.country}
              </p>
            </div>
            <div className="reservation__block">
              <span className="reservation__block-title">Speak to us</span>
              <p>
                <a href={contact.phoneHref}>{contact.phone}</a>
                <br />
                <a href={contact.emailHref}>{contact.email}</a>
              </p>
            </div>
            <div className="reservation__block">
              <span className="reservation__block-title">Hours</span>
              <ul className="reservation__hours">
                {hours.map((h) => (
                  <li key={h.day}>
                    <span>{h.day}</span>
                    <span>{h.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <footer className="reservation__footer">
        <div className="reservation__footer-inner">
          <span className="reservation__footer-mark">{site.wordmark}</span>
          <p className="reservation__footer-line">{footer.line}</p>
          <div className="reservation__footer-meta">
            <a href={contact.instagramHref} target="_blank" rel="noreferrer">
              {contact.instagram}
            </a>
            <span>{footer.credit}</span>
          </div>
        </div>
      </footer>
    </section>
  )
}
