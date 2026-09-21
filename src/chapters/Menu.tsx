import { useEffect, useRef } from 'react'
import { Heading } from '../components/Heading'
import { Placeholder } from '../components/Placeholder'
import { useReveal } from '../hooks/useReveal'
import { gsap } from '../lib/scroll'
import { openBooking } from '../lib/booking'
import { prefersReducedMotion } from '../lib/useReducedMotion'
import { menu, weekly, booking, contact } from '../content/site'
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
 * Oben eine Galerie echter Küchenfotos, darunter die Wochenkarte und die
 * vollständige Speisekarte 1:1 (Kategorien, Preise, Allergene) — alles direkt
 * auf der Seite lesbar, ohne Umweg über ein PDF. Bild und Gericht werden
 * bewusst nicht verknüpft, damit keine falschen Zuordnungen entstehen.
 */
/**
 * Läuft die ausgehängte Woche noch?
 *
 * Verglichen wird nur das Datum, nicht die Uhrzeit, und in der Zeitzone des
 * Gastes — auf den Tag genau reicht hier völlig, und es kommt ohne Bibliothek
 * aus. Am letzten Gültigkeitstag hängt die Karte noch.
 */
function weekIsOver(): boolean {
  const today = new Date()
  const iso = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')
  return iso > weekly.validUntil
}

export function Menu() {
  const root = useRef<HTMLElement>(null)
  const expired = weekIsOver()
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

        {/* Wochenkarte — der Mittagsteller dieser Woche, als eigener Aushang.
            Wechselt wöchentlich (siehe `weekly` in site.ts). Ist die Woche
            vorbei, verschwinden die Gerichte: eine vergangene Woche auf der
            Website führt Gäste in die Irre, ein Hinweis nicht. */}
        <aside className="menu__weekly" aria-label={weekly.title}>
          <span className="menu__weekly-glow" aria-hidden="true" />
          <div className="menu__weekly-head">
            <span className="overline">{weekly.label}</span>
            <h3 className="menu__weekly-title">{weekly.title}</h3>
            <p className="menu__weekly-when">
              {!expired && (
                <>
                  {weekly.periodPrefix} {weekly.period}
                  <br />
                </>
              )}
              {weekly.hours}
            </p>
          </div>

          {expired ? (
            <div className="menu__weekly-body menu__weekly-body--stale">
              <p className="menu__weekly-note-stale">{weekly.staleNote}</p>
              <a className="menu__weekly-phone" href={contact.phoneHref} target="_top">
                {contact.phone}
              </a>
            </div>
          ) : (
          <div className="menu__weekly-body">
            <p className="menu__weekly-dish">
              <span className="menu__weekly-name">
                {weekly.starter.name}
                {weekly.starter.allergens && (
                  <span className="menu__row-allergens"> {weekly.starter.allergens}</span>
                )}
              </span>
            </p>

            <span className="menu__weekly-joiner">{weekly.joiner}</span>

            {weekly.mains.map((m, i) => (
              <div key={m.name}>
                {i > 0 && <span className="menu__weekly-joiner">{weekly.orLabel}</span>}
                <p className="menu__weekly-dish">
                  <span className="menu__weekly-name">{m.name}</span>
                  <span className="menu__weekly-note">
                    {m.note}
                    {m.allergens && <span className="menu__row-allergens"> {m.allergens}</span>}
                  </span>
                </p>
              </div>
            ))}
          </div>
          )}

          <p className="menu__weekly-price">€ {weekly.price}</p>
        </aside>

        {/* Real menu — categories, prices, allergens */}
        <div className="menu__card-head">
          <span className="meta">{menu.cardLabel}</span>
          <span className="rule" />
        </div>
        <div className="menu__card" ref={cardRef}>
          {[1, 2].map((col) => (
            <div className="menu__col" key={col}>
              {menu.sections
                .filter((section) => section.column === col)
                .map((section) => (
                  <div className="menu__section" key={section.title}>
                    <h3 className="menu__section-title">{section.title}</h3>
                    <ul className="menu__list">
                      {section.items.map((d) => (
                        <li className="menu__row" key={d.name}>
                          <div className="menu__row-head">
                            <span className="menu__row-name">{d.name}</span>
                            <span className="menu__row-dots" aria-hidden="true" />
                            {d.price && <span className="menu__row-price">€ {d.price}</span>}
                          </div>
                          <p className="menu__row-note">
                            {d.note}
                            {d.allergens && (
                              <span className="menu__row-allergens"> · {d.allergens}</span>
                            )}
                          </p>
                          {d.plus && <p className="menu__row-plus">{d.plus}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          ))}
        </div>

        {/* Auf der gedruckten Karte stehen diese beiden mittig und für sich. */}
        <div className="menu__features">
          {menu.features.map((f) => (
            <div className="menu__feature" key={f.name}>
              <span className="meta">{f.label}</span>
              <p className="menu__feature-name">{f.name}</p>
              {f.note && <p className="menu__feature-note">{f.note}</p>}
              <p className="menu__feature-price">
                {f.size} <span aria-hidden="true">·</span> € {f.price}
              </p>
            </div>
          ))}
        </div>

        <div className="menu__foot">
          <p className="menu__note">{menu.priceNote}</p>
          <div className="menu__allergens">
            <span className="meta">{menu.allergenLabel}</span>
            <ul className="menu__allergens-list">
              {menu.allergens.map(([code, label]) => (
                <li key={code}>
                  <span className="menu__allergen-code">{code}</span> {label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Hunger geweckt? Der kürzeste Weg an den Tisch. */}
        <div className="chapter-cta">
          <p className="chapter-cta__text">Hunger bekommen?</p>
          <button className="btn btn--gold" onClick={openBooking}>
            {booking.cta}
            <span className="btn__arrow">→</span>
          </button>
        </div>
      </div>
    </section>
  )
}
