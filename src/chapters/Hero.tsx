import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, scrollToId } from '../lib/scroll'
import { prefersReducedMotion } from '../lib/useReducedMotion'
import { pointer } from '../lib/pointer'
import { hero, contact } from '../content/site'
import './hero.css'

/**
 * Chapter One — The Evening Begins.
 * The living room (atmosphere canvas) shows through; over it, an editorial
 * title sequence assembles once the loader lifts. Pointer nudges the title in
 * parallax (the camera "breathing"); scrolling pushes the hero back and up, as
 * if the camera begins moving deeper into the restaurant.
 */
export function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const introRan = useRef(false)

  // Intro title sequence — fires when the loader has lifted.
  useEffect(() => {
    if (!ready || introRan.current) return
    introRan.current = true
    const el = root.current
    if (!el) return

    if (prefersReducedMotion()) {
      gsap.set(el.querySelectorAll('[data-hero-in]'), { autoAlpha: 1, y: 0 })
      return
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
      tl.fromTo('[data-hero-overline]', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 1 })
        .fromTo(
          '.hero__line > span',
          { yPercent: 118 },
          { yPercent: 0, duration: 1.3, stagger: 0.12 },
          '-=0.6',
        )
        .fromTo('[data-hero-sub]', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1 }, '-=0.7')
        .fromTo('[data-hero-cta]', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12 }, '-=0.7')
        .fromTo('[data-hero-hint]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, '-=0.4')
        .fromTo('[data-hero-rail]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, '-=1')
    }, el)
    return () => ctx.revert()
  }, [ready])

  // Scroll: the camera pushes past the hero.
  useEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.to(inner.current, {
        yPercent: -12,
        scale: 0.94,
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
      })
    }, el)
    return () => ctx.revert()
  }, [])

  // Pointer parallax — the title breathes with the room.
  useEffect(() => {
    if (prefersReducedMotion()) return
    let raf = 0
    const layers = root.current?.querySelectorAll<HTMLElement>('[data-depth]') ?? []
    const loop = () => {
      layers.forEach((l) => {
        const depth = parseFloat(l.dataset.depth || '0')
        l.style.transform = `translate3d(${pointer.x * depth}px, ${pointer.y * depth}px, 0)`
      })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <section id="hero" ref={root} className="chapter hero" aria-label="The evening begins">
      {/* Candlelight on the table — a warm halo that drifts with the pointer and
          flickers like a real flame, anchoring the room's warmth to the hero. */}
      <div className="hero__glow" data-depth="22" aria-hidden="true">
        <span className="hero__glow-core" />
      </div>

      <div className="hero__rail" data-hero-rail aria-hidden="true">
        <span>{contact.address.city} — {contact.address.district}</span>
        <span className="hero__rail-line" />
        <span>Est. 2024</span>
      </div>

      <div ref={inner} className="hero__inner">
        <span className="overline" data-hero-overline data-hero-in>
          {hero.overline}
        </span>

        <h1 className="hero__title" data-depth="14">
          {hero.headline.map((line, i) => (
            <span className="hero__line" key={i}>
              <span>{line}</span>
            </span>
          ))}
        </h1>

        <p className="hero__sub lead" data-hero-sub data-hero-in data-depth="7">
          {hero.sub}
        </p>

        <div className="hero__ctas" data-depth="4">
          <button className="btn btn--gold" data-hero-cta data-hero-in onClick={() => scrollToId('reservation')}>
            {hero.primaryCta}
            <span className="btn__arrow">→</span>
          </button>
          <button className="btn btn--ghost" data-hero-cta data-hero-in onClick={() => scrollToId('dream')}>
            {hero.secondaryCta}
          </button>
        </div>
      </div>

      <button
        className="hero__hint"
        data-hero-hint
        onClick={() => scrollToId('dream')}
        aria-label={hero.scrollHint}
      >
        <span className="hero__hint-label">{hero.scrollHint}</span>
        <span className="hero__hint-track" aria-hidden="true">
          <span className="hero__hint-dot" />
        </span>
      </button>
    </section>
  )
}

// Keep ScrollTrigger imported for side-effect registration ordering.
void ScrollTrigger
