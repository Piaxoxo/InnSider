import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { site } from '../content/site'
import { prefersReducedMotion } from '../lib/useReducedMotion'
import './loader.css'

/**
 * The overture. Not a spinner — a curtain: the wordmark is revealed by a slow
 * upward wipe while a soft counter fills, then a warm light sweeps across and
 * the whole panel lifts to unveil the room beneath.
 */
export function Loader({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const reduced = prefersReducedMotion()

  useEffect(() => {
    const total = reduced ? 500 : 2200
    const start = performance.now()
    let raf = 0

    const tick = (now: number) => {
      const t = Math.min((now - start) / total, 1)
      // Ease-out so the number decelerates into 100.
      const eased = 1 - Math.pow(1 - t, 3)
      setCount(Math.round(eased * 100))
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        // Hold a beat on 100, then lift.
        window.setTimeout(() => setLeaving(true), reduced ? 100 : 420)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  return (
    <AnimatePresence onExitComplete={onDone}>
      {!leaving && (
        <motion.div
          className="loader"
          initial={{ opacity: 1 }}
          exit={{ y: '-100%' }}
          transition={{ duration: reduced ? 0.3 : 1.1, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="loader__inner">
            <span className="loader__overline">Wien — Meidling</span>

            <div className="loader__wordmark" aria-label={site.name}>
              <span className="loader__mask">
                <motion.span
                  initial={{ y: '110%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: reduced ? 0.3 : 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                >
                  {site.wordmark}
                </motion.span>
              </span>
              {!reduced && <span className="loader__sweep" />}
            </div>

            <div className="loader__foot">
              <span className="loader__tag">Eine Vision wird Wirklichkeit</span>
              <span className="loader__count">{String(count).padStart(3, '0')}</span>
            </div>

            <div className="loader__bar">
              <motion.span
                className="loader__fill"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: count / 100 }}
                transition={{ ease: 'linear' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
