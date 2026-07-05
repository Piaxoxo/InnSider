import { useEffect, useRef, useState } from 'react'
import { Atmosphere } from './three/Atmosphere'
import { Loader } from './components/Loader'
import { Nav } from './components/Nav'
import { Cursor } from './components/Cursor'
import { SoundToggle } from './components/SoundToggle'
import { PageTransition } from './components/PageTransition'
import { Hero } from './chapters/Hero'
import { Dream } from './chapters/Dream'
import { Bridge } from './chapters/Bridge'
import { Kitchen } from './chapters/Kitchen'
import { Menu } from './chapters/Menu'
import { Bar } from './chapters/Bar'
import { Evening } from './chapters/Evening'
import { Gallery } from './chapters/Gallery'
import { Events } from './chapters/Events'
import { Reservation } from './chapters/Reservation'
import { Legal } from './legal/Legal'
import { StageFilm } from './filmv/StageFilm'
import { useRoute } from './lib/useRoute'
import { useRouteTransition } from './lib/useRouteTransition'
import { initSmoothScroll, startScroll, stopScroll, ScrollTrigger } from './lib/scroll'
import { usePointerTracking } from './lib/pointer'

const OVERTURE_KEY = 'innsider-overture'

/**
 * The evening, assembled. The atmosphere canvas lives behind everything and
 * re-grades per chapter; the loader lifts to reveal the hero; then the guest
 * walks the nine chapters as one uninterrupted cinematic scroll.
 *
 * Navigation between the evening and the legal back rooms runs through a curtain
 * transition (useRouteTransition) so nothing ever hard-cuts. The overture plays
 * only on the first visit of a session — returning home is instant behind the
 * lifting curtain.
 */
export default function App() {
  const route = useRoute()
  const { shown, phase } = useRouteTransition(route)
  usePointerTracking()

  return (
    <>
      {shown === 'stage' ? (
        <StageFilm />
      ) : shown ? (
        <LegalShell route={shown as 'impressum' | 'agb'} />
      ) : (
        <HomeShell />
      )}
      <PageTransition phase={phase} />
    </>
  )
}

/** The full nine-chapter cinematic scroll. */
function HomeShell() {
  // Skip the overture if it already played this session (returning from legal).
  const seen = useRef(
    typeof sessionStorage !== 'undefined' && sessionStorage.getItem(OVERTURE_KEY) === '1',
  )
  const [ready, setReady] = useState(seen.current)

  // Boot smooth scroll once; hold it still until the overture lifts (first visit).
  useEffect(() => {
    const teardown = initSmoothScroll()
    if (seen.current) {
      startScroll()
      requestAnimationFrame(() => ScrollTrigger.refresh())
    } else {
      stopScroll()
    }

    // Re-measure scroll positions once webfonts settle (prevents drift).
    let cancelled = false
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) ScrollTrigger.refresh()
      })
    }
    return () => {
      cancelled = true
      teardown()
    }
  }, [])

  // When the loader finishes: release scroll, reveal chrome, re-measure.
  const handleLoaded = () => {
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(OVERTURE_KEY, '1')
    setReady(true)
    window.scrollTo(0, 0)
    startScroll()
    // Let the hero intro + layout settle, then refresh triggers.
    requestAnimationFrame(() => ScrollTrigger.refresh())
    setTimeout(() => ScrollTrigger.refresh(), 400)
  }

  return (
    <>
      <a className="skip-link" href="#dream">
        Zum Inhalt springen
      </a>

      <Atmosphere />
      <Cursor />
      {!seen.current && <Loader onDone={handleLoaded} />}
      <Nav visible={ready} />
      <SoundToggle visible={ready} />

      <main id="main">
        <Hero ready={ready} />
        <Dream />
        <Bridge />
        <Kitchen />
        <Menu />
        <Bar />
        <Evening />
        <Gallery />
        <Events />
        <Reservation />
      </main>
    </>
  )
}

/** Impressum / AGB — same atmosphere, no orb, no overture, scroll live at once. */
function LegalShell({ route }: { route: 'impressum' | 'agb' }) {
  useEffect(() => {
    const teardown = initSmoothScroll()
    startScroll()
    requestAnimationFrame(() => ScrollTrigger.refresh())
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 400)
    return () => {
      window.clearTimeout(t)
      teardown()
    }
  }, [route])

  return (
    <>
      <Atmosphere showOrb={false} />
      <Cursor />
      <main id="main">
        <Legal route={route} />
      </main>
    </>
  )
}
