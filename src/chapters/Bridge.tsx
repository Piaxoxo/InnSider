import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/scroll'
import { prefersReducedMotion } from '../lib/useReducedMotion'
import { Placeholder } from '../components/Placeholder'
import { bridge } from '../content/site'
import { media } from '../content/assets'
import './bridge.css'

/**
 * The bridge — where two worlds become one evening.
 *
 * A pinned stage holds Alice's world (the soul / the room) and Stefan's world
 * (the heart / the craft) apart, divided by a dark seam. As the guest scrolls,
 * the halves slide toward each other, the seam ignites into a line of
 * candlelight, and the closing lines rise over the join. One scroll-driven
 * custom property (`--p`, 0 = apart → 1 = merged) drives the whole thing, so the
 * direction of the merge flips cleanly between desktop (horizontal) and mobile
 * (vertical) in CSS alone. Reduced motion renders it already merged.
 */
export function Bridge() {
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    const st = stage.current
    if (!el || !st) return

    if (prefersReducedMotion()) {
      st.style.setProperty('--p', '1')
      return
    }

    st.style.setProperty('--p', '0')
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => st.style.setProperty('--p', self.progress.toFixed(4)),
    })
    return () => trigger.kill()
  }, [])

  return (
    <section id="bridge" ref={root} className="bridge" aria-label="Alice & Stefan — zwei Welten">
      <div className="bridge__stage" ref={stage}>
        <span className="bridge__overline overline">{bridge.overline}</span>

        {/* Alice — the soul */}
        <figure className="bridge__half bridge__half--alice">
          <div className="bridge__media">
            <Placeholder slot={media.aliceRoom} rounded={false} />
          </div>
          <span className="bridge__tint bridge__tint--alice" aria-hidden="true" />
          <figcaption className="bridge__label bridge__label--alice">
            <span className="bridge__tag">{bridge.alice.tag}</span>
            <span className="bridge__name">{bridge.alice.name}</span>
            <span className="bridge__note">{bridge.alice.note}</span>
          </figcaption>
        </figure>

        {/* Stefan — the heart */}
        <figure className="bridge__half bridge__half--stefan">
          <div className="bridge__media">
            <Placeholder slot={media.stefanPortrait} rounded={false} />
          </div>
          <span className="bridge__tint bridge__tint--stefan" aria-hidden="true" />
          <span className="bridge__steam" aria-hidden="true" />
          <figcaption className="bridge__label bridge__label--stefan">
            <span className="bridge__tag">{bridge.stefan.tag}</span>
            <span className="bridge__name">{bridge.stefan.name}</span>
            <span className="bridge__note">{bridge.stefan.note}</span>
          </figcaption>
        </figure>

        {/* The join — a line of candlelight that ignites as the worlds meet */}
        <span className="bridge__seam" aria-hidden="true" />

        {/* The payoff — rises over the seam once merged */}
        <div className="bridge__final">
          {bridge.lines.map((line, i) => (
            <p key={i} className={`bridge__line bridge__line--${i + 1}`}>
              {line.split('\n').map((t, j) => (
                <span key={j}>{t}</span>
              ))}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

// keep gsap import used for side-effect registration ordering
void gsap
