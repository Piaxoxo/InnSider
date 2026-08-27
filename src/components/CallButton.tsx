import { motion } from 'framer-motion'
import { contact, booking } from '../content/site'
import { scrollToId } from '../lib/scroll'
import './call-button.css'

/**
 * Floating actions, bottom-right: reserve and call. The two fastest paths to a
 * table, always within reach — reserving jumps to the embedded booking tool,
 * calling dials the house in one tap.
 */
export function CallButton({ visible }: { visible: boolean }) {
  return (
    <motion.div
      className="fab"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
    >
      <button
        className="fab__btn fab__btn--primary"
        onClick={() => scrollToId('reservation')}
        aria-label={booking.cta}
      >
        <span className="fab__ico" aria-hidden="true">✦</span>
        <span className="fab__label">{booking.ctaShort}</span>
      </button>
      <a className="fab__btn" href={contact.phoneHref} aria-label={`Anrufen — ${contact.phone}`}>
        <span className="fab__ico" aria-hidden="true">☎</span>
        <span className="fab__label">Anrufen</span>
      </a>
    </motion.div>
  )
}
