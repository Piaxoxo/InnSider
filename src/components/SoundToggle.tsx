import { useState } from 'react'
import { motion } from 'framer-motion'
import { playAmbience, stopAmbience, isAmbienceSupported } from '../lib/ambience'
import './sound-toggle.css'

/**
 * Ambient sound control. Off by default (never autoplays). Toggling on resumes
 * the AudioContext from a user gesture — the only way browsers allow sound —
 * and fades a warm room tone in. Animated equaliser bars show the state.
 */
export function SoundToggle({ visible }: { visible: boolean }) {
  const [on, setOn] = useState(false)
  if (!isAmbienceSupported()) return null

  const toggle = () => {
    if (on) {
      stopAmbience()
      setOn(false)
    } else {
      playAmbience()
      setOn(true)
    }
  }

  return (
    <motion.button
      className={`sound ${on ? 'is-on' : ''}`}
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Ton aus' : 'Ton an'}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
    >
      <span className="sound__bars" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
      <span className="sound__label">{on ? 'Ton an' : 'Ambiente'}</span>
    </motion.button>
  )
}
