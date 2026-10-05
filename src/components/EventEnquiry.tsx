import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { contact, events, site } from '../content/site'
import { onEnquiry, closeEnquiry } from '../lib/enquiry'
import { startScroll, stopScroll } from '../lib/scroll'
import './event-enquiry.css'

/**
 * Die Event-Anfrage.
 *
 * Vorher sprang der Knopf direkt in die Mail-App — mit einem leeren Fenster,
 * in das der Gast selbst hineinschreiben musste, was wir eigentlich wissen
 * wollen. Jetzt steht das Formular auf der Seite, im selben Rahmen wie das
 * Reservierungswerkzeug, und fragt die fünf Dinge ab, ohne die man ein Event
 * ohnehin nicht planen kann.
 *
 * Zum Versand, ehrlich: eine Website ohne Server kann keine Mail verschicken.
 * Am Ende übergibt das Formular die fertig geschriebene Nachricht deshalb an
 * die Mail-App des Gastes — mit Betreff, Empfänger und allen Angaben darin.
 * Der Unterschied zu vorher ist nicht klein: der Gast tippt nichts mehr
 * selbst, und im Haus kommt immer dieselbe, vollständige Anfrage an.
 */

const KINDS = ['Firmenevent', 'Private Feier', 'Der ganze Raum', 'Anderer Anlass']

export function EventEnquiry() {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(
    () =>
      onEnquiry((next) => {
        setOpen(next)
        if (next) setSent(false)
      }),
    [],
  )

  useEffect(() => {
    if (!open) {
      startScroll()
      return
    }
    stopScroll()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeEnquiry()
    }
    window.addEventListener('keydown', onKey)
    const focus = window.setTimeout(() => closeRef.current?.focus(), 380)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(focus)
    }
  }, [open])

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const get = (k: string) => String(f.get(k) ?? '').trim()

    // Das Datumsfeld liefert ISO; in der Mail soll es stehen, wie man es hier
    // schreibt.
    const datum = () => {
      const v = get('datum')
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v)
      return m ? `${m[3]}.${m[2]}.${m[1]}` : v
    }

    const lines = [
      'Guten Tag,',
      '',
      'ich möchte eine Veranstaltung anfragen.',
      '',
      `Anlass: ${get('anlass')}`,
      `Wunschdatum: ${datum() || '—'}`,
      `Personen: ${get('personen') || '—'}`,
      '',
      `Name: ${get('name')}`,
      `E-Mail: ${get('mail')}`,
      `Telefon: ${get('telefon') || '—'}`,
      '',
      get('nachricht') ? `${get('nachricht')}\n` : '',
      'Vielen Dank!',
    ]

    const href =
      `mailto:${contact.emailReserve}` +
      `?subject=${encodeURIComponent(`Event-Anfrage — ${get('anlass')} — ${site.name}`)}` +
      `&body=${encodeURIComponent(lines.join('\n'))}`

    // _top, damit der Wechsel auch aus einer Einbettung heraus greift.
    window.open(href, '_top')
    setSent(true)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="enq"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-modal="true"
          aria-label={events.cta}
        >
          <div className="enq__scrim" onClick={() => closeEnquiry()} aria-hidden="true" />

          <motion.div
            className="enq__panel"
            initial={{ opacity: 0, y: 26, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.99 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className="enq__head">
              <div className="enq__titles">
                <span className="enq__mark">{site.wordmark}</span>
                <span className="enq__title">{events.cta}</span>
              </div>
              <button
                ref={closeRef}
                type="button"
                className="enq__close"
                onClick={() => closeEnquiry()}
                aria-label="Schließen"
                data-cursor="hover"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </header>

            {sent ? (
              <div className="enq__done">
                <p className="enq__done-mark" aria-hidden="true">
                  ✦
                </p>
                <p className="enq__done-text">{events.form.doneTitle}</p>
                <p className="enq__done-note">{events.form.doneNote}</p>
                <a className="btn btn--ghost" href={contact.phoneHref} target="_top">
                  {contact.phone}
                </a>
              </div>
            ) : (
              <form className="enq__form" onSubmit={submit}>
                <label className="enq__field enq__field--wide">
                  <span>Anlass</span>
                  <select name="anlass" defaultValue={KINDS[0]}>
                    {KINDS.map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                  </select>
                </label>

                <label className="enq__field">
                  <span>Wunschdatum</span>
                  <input type="date" name="datum" />
                </label>

                <label className="enq__field">
                  <span>Personen</span>
                  <input type="number" name="personen" min={1} inputMode="numeric" placeholder="z. B. 20" />
                </label>

                <label className="enq__field">
                  <span>Name</span>
                  <input type="text" name="name" required autoComplete="name" />
                </label>

                <label className="enq__field">
                  <span>E-Mail</span>
                  <input type="email" name="mail" required autoComplete="email" />
                </label>

                <label className="enq__field enq__field--wide">
                  <span>Telefon (optional)</span>
                  <input type="tel" name="telefon" autoComplete="tel" />
                </label>

                <label className="enq__field enq__field--wide">
                  <span>Ihr Anlass</span>
                  <textarea name="nachricht" rows={3} placeholder={events.form.placeholder} />
                </label>

                <div className="enq__submit">
                  <button className="btn btn--gold" type="submit">
                    {events.form.send}
                    <span className="btn__arrow">→</span>
                  </button>
                  <span className="enq__to">{events.form.toNote}</span>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
