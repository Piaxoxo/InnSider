import { useEffect, useState } from 'react'
import { Atmosphere } from './three/Atmosphere'
import { Loader } from './components/Loader'
import { Nav } from './components/Nav'
import { Cursor } from './components/Cursor'
import { SoundToggle } from './components/SoundToggle'
import { Hero } from './chapters/Hero'
import { Dream } from './chapters/Dream'
import { Kitchen } from './chapters/Kitchen'
import { Menu } from './chapters/Menu'
import { Bar } from './chapters/Bar'
import { Evening } from './chapters/Evening'
import { Gallery } from './chapters/Gallery'
import { Events } from './chapters/Events'
import { Reservation } from './chapters/Reservation'
import { Legal } from './legal/Legal'
import { useRoute } from './lib/useRoute'
import { initSmoothScroll, startScroll, stopScroll, ScrollTrigger } from './lib/scroll'
import { usePointerTracking } from './lib/pointer'

/**
 * The evening, assembled. The atmosphere canvas lives behind everything and
 * re-grades per chapter; the loader lifts to reveal the hero; then the guest
 * walks the nine chapters as one uninterrupted cinematic scroll.
 *
 * The legal pages (Impressum / AGB) live behind a hash route and reuse the same
 * atmosphere — minus the hero orb and the overture loader — so they feel like a
 * quiet back room of the same house rather than a different site.
 */
export default function App() {
  const route = useRoute()
  usePointerTracking()

  return route ? <LegalShell route={route} /> : <HomeShell />
}

/** The full nine-chapter cinematic scroll. */
function HomeShell() {
  const [ready, setReady] = useState(false)

  // Boot smooth scroll once; hold it still until the overture lifts.
  useEffect(() => {
    const teardown = initSmoothScroll()
    stopScroll()

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
      <Loader onDone={handleLoaded} />
      <Nav visible={ready} />
      <SoundToggle visible={ready} />

      <main id="main">
        <Hero ready={ready} />
        <Dream />
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
