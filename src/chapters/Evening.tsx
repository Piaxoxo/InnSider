import { useEffect, useRef } from 'react'
import { gsap } from '../lib/scroll'
import { prefersReducedMotion } from '../lib/useReducedMotion'
import { Heading } from '../components/Heading'
import { useReveal } from '../hooks/useReveal'
import { evening } from '../content/site'
import './evening.css'

/**
 * Chapter Six — The Evening Evolves.
 * A timeline you scroll through as the night deepens (the atmosphere behind is
 * already shifting toward blue-black here). A brass line fills as each hour
 * lights up in turn — the guest feels the evening progress.
 */
export function Evening() {
  const root = useRef<HTMLElement>(null)
  const headRef = useReveal<HTMLDivElement>({ selector: '[data-reveal]', y: 28 })

  useEffect(() => {
    const el = root.current
    if (!el) return
    const rows = el.querySelectorAll<HTMLElement>('.evening__row')

    if (prefersReducedMotion()) {
      rows.forEach((r) => r.classList.add('is-lit'))
      gsap.set('.evening__progress-fill', { scaleY: 1 })
      return
    }

    const ctx = gsap.context(() => {
      // Fill the brass line across the whole timeline.
      gsap.to('.evening__progress-fill', {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: '.evening__track', start: 'top 60%', end: 'bottom 70%', scrub: true },
      })
      // Light each hour as it arrives.
      rows.forEach((row) => {
        ScrollTriggerLight(row)
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section id="evening" ref={root} className="chapter evening" aria-label="The night">
      <div className="evening__wrap">
        <div className="evening__head" ref={headRef}>
          <div className="evening__head-top" data-reveal>
            <span className="overline">{evening.overline}</span>
            <span className="chapter-index">{evening.chapter}</span>
          </div>
          <Heading text={evening.headline} className="evening__headline" />
          <p className="lead evening__intro" data-reveal>
            {evening.intro}
          </p>
        </div>

        <div className="evening__track">
          <div className="evening__progress" aria-hidden="true">
            <span className="evening__progress-fill" />
          </div>
          <ol className="evening__rows">
            {evening.timeline.map((t) => (
              <li className="evening__row" key={t.time}>
                <span className="evening__dot" aria-hidden="true" />
                <span className="evening__time">{t.time}</span>
                <div className="evening__content">
                  <h3 className="evening__row-title">{t.title}</h3>
                  <p className="evening__row-body">{t.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

/** Adds a lit-on-enter trigger to a timeline row. */
function ScrollTriggerLight(row: HTMLElement) {
  gsap.to(row, {
    scrollTrigger: {
      trigger: row,
      start: 'top 68%',
      onEnter: () => row.classList.add('is-lit'),
      onLeaveBack: () => row.classList.remove('is-lit'),
    },
  })
}
