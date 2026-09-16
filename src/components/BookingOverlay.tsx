import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { booking, site } from '../content/site'
import { onBooking, closeBooking } from '../lib/booking'
import { startScroll, stopScroll } from '../lib/scroll'
import './booking-overlay.css'

/**
 * The reservation tool, framed.
 *
 * The booking app has its own visual language, so it is never shown bare. It
 * opens in a lit panel — dark surround, brass hairline, the house wordmark
 * above it — which holds the guest inside the evening while they pick a time.
 * The frame is loaded only once it is asked for, so the tool costs nothing
 * until someone reaches for it.
 */
export function BookingOverlay() {
  const [open, setOpen] = useState(false)
  // Once loaded, keep the tool mounted for the rest of the visit: reopening
  // should not throw the guest back to an empty form.
  const [touched, setTouched] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(
    () =>
      onBooking((next) => {
        setOpen(next)
        if (next) setTouched(true)
      }),
    [],
  )

  // Hold the evening still behind the panel, and let Escape close it.
  useEffect(() => {
    if (!open) {
      startScroll()
      return
    }
    stopScroll()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeBooking()
    }
    window.addEventListener('keydown', onKey)
    const focus = window.setTimeout(() => closeRef.current?.focus(), 380)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(focus)
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="bookov"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-modal="true"
          aria-label={booking.cta}
        >
          <div className="bookov__scrim" onClick={() => closeBooking()} aria-hidden="true" />

          <motion.div
            className="bookov__panel"
            initial={{ opacity: 0, y: 26, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.99 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className="bookov__head">
              <div className="bookov__titles">
                <span className="bookov__mark">{site.wordmark}</span>
                <span className="bookov__title">{booking.cta}</span>
              </div>
              <button
                ref={closeRef}
                type="button"
                className="bookov__close"
                onClick={() => closeBooking()}
                aria-label={booking.closeLabel}
                data-cursor="hover"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </header>

            <div className="bookov__stage">
              {touched && (
                <iframe
                  className="bookov__frame"
                  src={booking.url}
                  title={booking.cta}
                  allow="payment"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              )}
            </div>

            <footer className="bookov__foot">
              <span>{booking.fallbackNote}</span>{' '}
              <a href={booking.url} target="_blank" rel="noreferrer" data-cursor="hover">
                {booking.openLabel} ↗
              </a>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
