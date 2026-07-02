import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Heading } from '../components/Heading'
import { Placeholder } from '../components/Placeholder'
import { useReveal } from '../hooks/useReveal'
import { menu } from '../content/site'
import { media } from '../content/assets'
import './menu.css'

// Rotate the three delivered dish slots across the four menu entries so each
// selection lights a distinct frame; the fourth reuses the hero plate.
const dishSlots = [media.dishHero, media.dish2, media.dish3, media.dishHero]

/**
 * Chapter Four — The Table.
 * Not a list — a slow read. Selecting a dish lights its plate in the large
 * frame and reveals its note and wine pairing. Hovering shifts the warm glow.
 */
export function Menu() {
  const [active, setActive] = useState(0)
  const headRef = useReveal<HTMLDivElement>({ selector: '[data-reveal]', y: 28 })
  const listRef = useReveal<HTMLUListElement>({ selector: '.menu__row', y: 30, stagger: 0.1 })
  const dish = menu.dishes[active]

  return (
    <section id="menu" className="chapter menu" aria-label="The table — menu">
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

        <div className="menu__body">
          {/* Featured plate */}
          <div className="menu__feature" data-cursor="hover">
            <div className="menu__feature-frame">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  className="menu__feature-media"
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Placeholder slot={dishSlots[active]} />
                </motion.div>
              </AnimatePresence>
              <span className="menu__feature-glow" aria-hidden="true" />
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                className="menu__feature-caption"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5 }}
              >
                <span className="menu__pairing-label">Pairs with</span>
                <span className="menu__pairing">{dish.pairing}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dish list */}
          <ul className="menu__list" ref={listRef}>
            {menu.dishes.map((d, i) => (
              <li key={d.name}>
                <button
                  className={`menu__row ${i === active ? 'is-active' : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  aria-pressed={i === active}
                >
                  <div className="menu__row-main">
                    <span className="menu__row-tag">{d.tag}</span>
                    <h3 className="menu__row-name">{d.name}</h3>
                    <span className="menu__row-en">{d.en}</span>
                    <p className="menu__row-note">{d.note}</p>
                  </div>
                  <span className="menu__row-price">
                    {d.price === 'Daily' ? d.price : `€ ${d.price}`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <p className="menu__foot">The full, ever-changing card is presented at your table.</p>
      </div>
    </section>
  )
}
