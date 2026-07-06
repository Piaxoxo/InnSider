import { useRef, useState, type FormEvent } from 'react'
import { Heading } from '../components/Heading'
import { useReveal } from '../hooks/useReveal'
import { reservation, contact, footer, site, testimonials } from '../content/site'
import { navigate } from '../lib/useRoute'
import './reservation.css'

// FormSubmit: no backend needed on a static host. Posts the form and emails it
// straight to the house — nothing opens the visitor's mail app. The endpoint is
// activated once via a confirmation link sent to this address on first use.
const FORM_ENDPOINT = 'https://formsubmit.co/ajax/office@innsider-restaurant.at'

/**
 * Kapitel Neun — Reservieren.
 * Das emotionale Finale. Ein Formular, das die Anfrage direkt per FormSubmit an
 * das Haus schickt (kein Mailprogramm öffnet sich), mit Sende-Status und
 * warmer Inline-Bestätigung.
 */
export function Reservation() {
  const headRef = useReveal<HTMLDivElement>({ selector: '[data-reveal]', y: 30 })
  const formRef = useReveal<HTMLDivElement>({ selector: '[data-reveal-f]', y: 26, stagger: 0.08 })
  const voicesRef = useReveal<HTMLDivElement>({ selector: '[data-reveal-v]', y: 30, stagger: 0.1 })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [fallbackHref, setFallbackHref] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)
  const sent = status === 'sent'

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status === 'sending') return
    const data = new FormData(e.currentTarget)

    // A guaranteed fallback: a mailto prefilled with the request, used only if
    // the serverless relay is unreachable or hasn't been activated yet — so a
    // reservation is never lost.
    const body = [
      'Guten Tag,',
      '',
      'ich möchte gerne reservieren.',
      '',
      `Name: ${data.get('name') || ''}`,
      `E-Mail: ${data.get('email') || ''}`,
      `Wunschdatum: ${data.get('date') || ''}`,
      `Personen: ${data.get('guests') || ''}`,
      `Anlass: ${data.get('occasion') || '—'}`,
      '',
      'Vielen Dank!',
    ].join('\n')
    setFallbackHref(
      `mailto:office@innsider-restaurant.at?subject=${encodeURIComponent(
        `Reservierungsanfrage — ${data.get('name') || ''}`,
      )}&body=${encodeURIComponent(body)}`,
    )

    setStatus('sending')
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          Name: data.get('name'),
          'E-Mail': data.get('email'),
          Wunschdatum: data.get('date'),
          Personen: data.get('guests'),
          Anlass: data.get('occasion') || '—',
          _subject: `Reservierungsanfrage — ${data.get('name') || ''}`,
          _template: 'table',
          _captcha: 'false',
        }),
      })
      // FormSubmit returns 200 with { success } — treat a false/missing success
      // (e.g. not-yet-activated) as a failure so the fallback kicks in.
      const json = (await res.json().catch(() => ({}))) as { success?: string | boolean }
      const ok = res.ok && String(json.success ?? 'true') !== 'false'
      if (!ok) throw new Error('relay')
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

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
                      {n} {n === 1 ? 'Person' : 'Personen'}
                    </option>
                  ))}
                  <option value="12+">12+ (privat)</option>
                </select>
              </div>
              <div className="reservation__field reservation__field--wide" data-reveal-f>
                <label htmlFor="r-occasion">{reservation.fields.occasion}</label>
                <input id="r-occasion" name="occasion" autoComplete="off" />
              </div>
              <div className="reservation__submit" data-reveal-f>
                <button className="btn btn--gold" type="submit" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Wird gesendet …' : reservation.cta}
                  {status !== 'sending' && <span className="btn__arrow">→</span>}
                </button>
                <span className="reservation__reassure">{reservation.reassurance}</span>
              </div>
              {status === 'error' && (
                <div className="reservation__error" role="alert">
                  <p>
                    Die Online-Übermittlung ist gerade nicht möglich. Ihre Anfrage geht auf einem
                    dieser Wege garantiert bei uns ein:
                  </p>
                  <div className="reservation__error-actions">
                    <a className="btn btn--gold" href={fallbackHref || contact.emailReserveHref}>
                      Als E-Mail senden
                      <span className="btn__arrow">→</span>
                    </a>
                    <a className="btn btn--ghost" href={contact.phoneHref}>
                      <span className="btn__ico" aria-hidden="true">☎</span>
                      {contact.phone}
                    </a>
                  </div>
                </div>
              )}
            </form>
          ) : (
            <div className="reservation__confirm" role="status">
              <span className="reservation__confirm-mark">✦</span>
              <h3>Vielen Dank — Ihre Anfrage ist da.</h3>
              <p>
                Wir haben Ihre Reservierungsanfrage erhalten und melden uns persönlich, meist noch
                am selben Tag. Für Rückfragen erreichen Sie uns unter{' '}
                <a href={contact.emailHref}>{contact.email}</a>.
              </p>
            </div>
          )}

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
