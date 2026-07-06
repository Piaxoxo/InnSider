import { motion } from 'framer-motion'
import { contact } from '../content/site'
import './call-button.css'

/**
 * Floating call-to-action, bottom-right. A single tap dials the house — the
 * fastest possible path to a reservation on a phone.
 */
export function CallButton({ visible }: { visible: boolean }) {
  return (
    <motion.a
      className="callfab"
      href={contact.phoneHref}
      aria-label={`Anrufen — ${contact.phone}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
    >
      <span className="callfab__ico" aria-hidden="true">☎</span>
      <span className="callfab__label">Anrufen</span>
    </motion.a>
  )
}
