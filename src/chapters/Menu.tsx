import { Heading } from '../components/Heading'
import { Placeholder } from '../components/Placeholder'
import { useReveal } from '../hooks/useReveal'
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
  media.dishBeet2,
  media.dishChicken,
  media.dishPeach,
  media.seasonSalad,
  media.seasonRose,
]

/**
 * Kapitel Vier — Gaumenfreuden.
 * Links die verifizierte Karte (echte Gerichte & Preise), rechts eine Galerie
 * echter Küchenfotos. Bild und Gericht werden bewusst nicht verknüpft, damit
 * keine falschen Namen/Preise entstehen.
 */
export function Menu() {
  const headRef = useReveal<HTMLDivElement>({ selector: '[data-reveal]', y: 28 })
  const bodyRef = useReveal<HTMLDivElement>({ selector: '[data-reveal-b]', y: 32, stagger: 0.08 })

  return (
    <section id="menu" className="chapter menu" aria-label="Gaumenfreuden — Menü">
      <div className="menu__wrap">
        <div className="menu__head" ref={headRef}>
          <div className="menu__head-top" data-reveal>
            <span className="overline">{menu.overline}</span>
            <span className="chapter-index">{menu.chapter}</span>
          </div>
          <Heading text={menu.headline} className="menu__headline" />
          <p className="lead menu__intro" data-reveal>
            {menu.intro}
          </p>
        </div>

        <div className="menu__body" ref={bodyRef}>
          {/* Verified dish list */}
          <div className="menu__card" data-reveal-b>
            <ul className="menu__list">
              {menu.dishes.map((d) => (
                <li className="menu__row" key={d.name}>
                  <div className="menu__row-main">
                    <span className="menu__row-tag">{d.tag}</span>
                    <h3 className="menu__row-name">{d.name}</h3>
                    <span className="menu__row-en">{d.en}</span>
                    <p className="menu__row-note">{d.note}</p>
                  </div>
                  {d.price && <span className="menu__row-price">€ {d.price}</span>}
                </li>
              ))}
            </ul>
            <p className="menu__lunch">{menu.lunchNote}</p>
          </div>

          {/* Gaumenfreuden gallery — neutral captions, real photos */}
          <div className="menu__plates">
            <span className="menu__plates-label" data-reveal-b>
              {menu.galleryNote}
            </span>
            <div className="menu__plates-grid">
              {plates.map((p) => (
                <figure className="menu__plate" key={p.id} data-cursor="hover" data-reveal-b>
                  <Placeholder slot={p} />
                  <figcaption>{p.label}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>

        <p className="menu__foot">{menu.foot}</p>
      </div>
    </section>
  )
}
