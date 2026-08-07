import { useEffect, useRef } from 'react'
import { Heading } from '../components/Heading'
import { Placeholder } from '../components/Placeholder'
import { useReveal } from '../hooks/useReveal'
import { gsap } from '../lib/scroll'
import { prefersReducedMotion } from '../lib/useReducedMotion'
import { menu } from '../content/site'
import { media } from '../content/assets'
import './menu.css'

// Real photos from the kitchen, shown as a "Gaumenfreuden" gallery with
// neutral captions — NOT paired to specific menu entries or prices.
const plates = [
  media.dishBeet1,
  media.dishFish,
  media.seasonSoup,
  media.dishRadicchio,
  media.dishChicken,
  media.dishPeach,
  media.seasonSalad,
  media.seasonRose,
]

/**
 * Kapitel Vier — Gaumenfreuden.
 * Oben eine Galerie echter Küchenfotos, darunter die echte Speisekarte 1:1
 * (Kategorien, Preise, Allergene) plus PDF-Download. Bild und Gericht werden
 * bewusst nicht verknüpft, damit keine falschen Zuordnungen entstehen.
 */
export function Menu() {
  const root = useRef<HTMLElement>(null)
  const headRef = useReveal<HTMLDivElement>({ selector: '[data-reveal]', y: 28 })
  const galleryRef = useReveal<HTMLDivElement>({ selector: '.menu__plate', y: 32, stagger: 0.07 })
  const cardRef = useReveal<HTMLDivElement>({ selector: '.menu__section', y: 30, stagger: 0.1 })

  // Signature: the card is written. Each dot leader draws itself left-to-right
  // as its section arrives — a fountain pen filling in the menu.
  useEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>('.menu__section').forEach((section) => {
        gsap.fromTo(
          section.querySelectorAll('.menu__row-dots'),
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.7,
            ease: 'power2.out',
            stagger: 0.06,
            scrollTrigger: { trigger: section, start: 'top 82%' },
          },
        )
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section id="menu" ref={root} className="chapter menu" aria-label="Gaumenfreuden — Speisekarte">
      <div className="menu__wrap">
        <div className="menu__head" ref={headRef}>
          <div className="menu__head-copy">
            <div className="menu__head-top" data-reveal>
              <span className="overline">{menu.overline}</span>
            </div>
            <Heading text={menu.headline} className="menu__headline" />
            <p className="lead menu__intro" data-reveal>
              {menu.intro}
            </p>
          </div>
          {/* The otherwise-empty column: an oversized ghost numeral and the
              chapter mark set vertically — the page reads as composed. */}
          <div className="menu__head-mark" aria-hidden="true">
            <span className="ghost-numeral">04</span>
            <span className="menu__head-vertical meta">{menu.chapter}</span>
          </div>
        </div>

        {/* Gaumenfreuden gallery — real photos, neutral captions */}
        <div className="menu__plates" ref={galleryRef}>
          <div className="menu__plates-head">
            <span className="meta">{menu.galleryNote}</span>
            <span className="rule" />
          </div>
          <div className="menu__plates-grid">
            {plates.map((p, i) => (
              <figure className={`menu__plate menu__plate--${i + 1}`} key={p.id} data-cursor="hover">
                <Placeholder slot={p} />
                <figcaption>{p.label}</figcaption>
              </figure>
            ))}
          </div>
        </div>

        {/* Real menu — categories, prices, allergens */}
        <div className="menu__card-head">
          <span className="meta">{menu.cardLabel}</span>
          <span className="rule" />
        </div>
        <div className="menu__card" ref={cardRef}>
          {menu.sections.map((section) => (
            <div className="menu__section" key={section.title}>
              <h3 className="menu__section-title">{section.title}</h3>
              <ul className="menu__list">
                {section.items.map((d) => (
                  <li className="menu__row" key={d.name}>
                    <div className="menu__row-head">
                      <span className="menu__row-name">{d.name}</span>
                      <span className="menu__row-dots" aria-hidden="true" />
                      <span className="menu__row-price">€ {d.price}</span>
                    </div>
                    <p className="menu__row-note">
                      {d.note}
                      {d.allergens && <span className="menu__row-allergens"> · {d.allergens}</span>}
                    </p>
                    {d.plus && <p className="menu__row-plus">{d.plus}</p>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="menu__foot">
          <p className="menu__note">{menu.priceNote}</p>
          <p className="menu__note">{menu.allergenNote}</p>
          <a className="menu__pdf" href={menu.pdfHref} target="_blank" rel="noreferrer">
            <span>{menu.pdfLabel}</span>
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
    </section>
  )
}
