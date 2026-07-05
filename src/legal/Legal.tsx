import { useEffect, useState } from 'react'
import { Heading } from '../components/Heading'
import { useReveal } from '../hooks/useReveal'
import { navigate } from '../lib/useRoute'
import { prefersReducedMotion } from '../lib/useReducedMotion'
import { impressum, agb } from '../content/legal'
import { site, contact, footer } from '../content/site'
import type { Route } from '../lib/useRoute'
import './legal.css'

/**
 * The legal pages — Impressum & AGB — rendered in the exact design language of
 * the homepage: dark luxury, editorial serif display, gold overlines, cinematic
 * scroll reveals, the same living atmosphere canvas behind everything. The legal
 * text itself is reproduced verbatim from src/content/legal.ts and is never
 * altered here — this file is layout only.
 *
 * Impressum is an editorial card grid. AGB gets a sticky table of contents with
 * scroll-spy, numbered sections and a back-to-top control. Both fall back
 * gracefully under reduced motion (reveals become plain, ToC stays usable).
 */
export function Legal({ route }: { route: Exclude<Route, ''> }) {
  return route === 'agb' ? <Agb /> : <Impressum />
}

/** Shared cinematic header + a quiet "back to the evening" link. */
function LegalHero({
  overline,
  title,
  sub,
  intro,
}: {
  overline: string
  title: string
  sub: string
  intro: string
}) {
  const ref = useReveal<HTMLDivElement>({ selector: '[data-reveal]', y: 26 })
  return (
    <header className="legal__hero" ref={ref}>
      <button className="legal__back" onClick={() => navigate('')} data-cursor="hover" data-reveal>
        <span className="legal__back-arrow" aria-hidden="true">
          ←
        </span>
        Zurück zum Abend
      </button>
      <span className="overline legal__overline" data-reveal>
        {overline}
      </span>
      <Heading text={title} as="h1" className="legal__title" />
      <p className="legal__sub serif-em" data-reveal>
        {sub}
      </p>
      <p className="lead legal__intro" data-reveal>
        {intro}
      </p>
    </header>
  )
}

function Impressum() {
  const gridRef = useReveal<HTMLDivElement>({ selector: '[data-reveal-c]', y: 30, stagger: 0.08 })
  const noticesRef = useReveal<HTMLDivElement>({ selector: '[data-reveal-n]', y: 26, stagger: 0.1 })

  return (
    <article className="legal legal--impressum">
      <div className="legal__wrap">
        <LegalHero
          overline={impressum.overline}
          title={impressum.title}
          sub={impressum.sub}
          intro={impressum.intro}
        />

        <div className="legal__cards" ref={gridRef}>
          {impressum.blocks.map((block) => (
            <section className="legal__card" key={block.title} data-reveal-c>
              <h2 className="legal__card-title">{block.title}</h2>
              <dl className="legal__rows">
                {block.rows.map((row) => (
                  <div className="legal__row" key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>
                      {row.href ? (
                        <a
                          href={row.href}
                          data-cursor="hover"
                          {...(row.href.startsWith('http')
                            ? { target: '_blank', rel: 'noreferrer' }
                            : {})}
                        >
                          {row.value}
                        </a>
                      ) : (
                        row.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <div className="legal__notices" ref={noticesRef}>
          {impressum.notices.map((notice) => (
            <section className="legal__notice" key={notice.title} data-reveal-n>
              <h2 className="legal__notice-title">{notice.title}</h2>
              <p>{notice.body}</p>
            </section>
          ))}
        </div>
      </div>

      <LegalFooter />
    </article>
  )
}

function Agb() {
  const [active, setActive] = useState(agb.sections[0]?.id ?? '')

  // Scroll-spy: light up the ToC entry whose section is centred in the viewport.
  useEffect(() => {
    const els = agb.sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[]
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  const jump = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const smooth = !prefersReducedMotion()
    el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
  }

  return (
    <article className="legal legal--agb">
      <div className="legal__wrap">
        <LegalHero
          overline={agb.overline}
          title={agb.title}
          sub={agb.sub}
          intro={agb.intro}
        />

        <div className="legal__layout">
          <aside className="legal__toc" aria-label="Inhaltsverzeichnis">
            <span className="legal__toc-label">Inhalt</span>
            <nav>
              <ol>
                {agb.sections.map((s) => (
                  <li key={s.id}>
                    <button
                      className={`legal__toc-link ${active === s.id ? 'is-active' : ''}`}
                      onClick={() => jump(s.id)}
                      data-cursor="hover"
                    >
                      <span className="legal__toc-n">{s.n}</span>
                      <span className="legal__toc-t">{s.title}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <div className="legal__sections">
            {agb.sections.map((s) => (
              <AgbSection key={s.id} id={s.id} n={s.n} title={s.title} paragraphs={s.paragraphs} />
            ))}
          </div>
        </div>
      </div>

      <BackToTop />
      <LegalFooter />
    </article>
  )
}

function AgbSection({
  id,
  n,
  title,
  paragraphs,
}: {
  id: string
  n: string
  title: string
  paragraphs: string[]
}) {
  const ref = useReveal<HTMLElement>({ selector: '[data-reveal-s]', y: 24, stagger: 0.06 })
  return (
    <section className="legal__section" id={id} ref={ref}>
      <div className="legal__section-head" data-reveal-s>
        <span className="legal__section-n">{n.padStart(2, '0')}</span>
        <h2 className="legal__section-title">{title}</h2>
      </div>
      {paragraphs.map((p, i) => (
        <p className="legal__section-p" key={i} data-reveal-s>
          {p}
        </p>
      ))}
    </section>
  )
}

/** Appears once the guest has scrolled past the fold; glides back to the top. */
function BackToTop() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <button
      className={`legal__totop ${show ? 'is-visible' : ''}`}
      onClick={() =>
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
      }
      aria-label="Nach oben"
      data-cursor="hover"
    >
      <span aria-hidden="true">↑</span>
    </button>
  )
}

function LegalFooter() {
  const other = window.location.hash.includes('agb')
    ? { route: 'impressum' as const, label: 'Impressum' }
    : { route: 'agb' as const, label: 'AGB' }
  return (
    <footer className="legal__footer">
      <div className="legal__footer-inner">
        <button className="legal__footer-mark" onClick={() => navigate('')} data-cursor="hover">
          {site.wordmark}
        </button>
        <p className="legal__footer-line">{footer.line}</p>
        <div className="legal__footer-meta">
          <button onClick={() => navigate(other.route)} data-cursor="hover">
            {other.label}
          </button>
          <a href={contact.instagramHref} target="_blank" rel="noreferrer" data-cursor="hover">
            {contact.instagram}
          </a>
          <span>{footer.credit}</span>
        </div>
      </div>
    </footer>
  )
}
