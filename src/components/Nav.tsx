import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { nav, site, contact } from '../content/site'
import { scrollToId } from '../lib/scroll'
import './nav.css'

/**
 * A quiet top bar that never competes with the room: wordmark, a live chapter
 * readout, and Reserve. The menu opens a full-screen chapter index — the story
 * as a table of contents. Active chapter is tracked by IntersectionObserver.
 */
export function Nav({ visible }: { visible: boolean }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('hero')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const sections = nav.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    sections.forEach((s) => io.observe(s))

    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const go = (id: string) => {
    setOpen(false)
    // Let the menu begin closing before the scroll takes over.
    window.setTimeout(() => scrollToId(id), 120)
  }

  const activeItem = nav.find((n) => n.id === active) ?? nav[0]

  return (
    <>
      <motion.header
        className={`nav ${scrolled ? 'nav--scrolled' : ''}`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: visible ? 0 : -80, opacity: visible ? 1 : 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <button className="nav__brand" onClick={() => go('hero')} aria-label={`${site.name} — home`}>
          {site.wordmark}
        </button>

        <div className="nav__center" aria-hidden="true">
          <span className="nav__now-index">{activeItem.index}</span>
          <span className="nav__now-label">{activeItem.label}</span>
        </div>

        <div className="nav__right">
          <button className="nav__reserve" onClick={() => go('reservation')}>
            Reserve
          </button>
          <button
            className={`nav__toggle ${open ? 'is-open' : ''}`}
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <span />
            <span />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.nav
            className="menu"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
            aria-label="Chapters"
          >
            <ol className="menu__list">
              {nav.map((n, i) => (
                <li key={n.id}>
                  <motion.button
                    className={`menu__item ${active === n.id ? 'is-active' : ''}`}
                    onClick={() => go(n.id)}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ delay: 0.15 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className="menu__index">{n.index}</span>
                    <span className="menu__label">{n.label}</span>
                    <span className="menu__arrow">↗</span>
                  </motion.button>
                </li>
              ))}
            </ol>
            <motion.div
              className="menu__foot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
            >
              <a href={contact.phoneHref}>{contact.phone}</a>
              <a href={contact.emailHref}>{contact.email}</a>
              <a href={contact.instagramHref} target="_blank" rel="noreferrer">
                {contact.instagram}
              </a>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}
