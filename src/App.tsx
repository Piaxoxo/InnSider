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
import { initSmoothScroll, startScroll, stopScroll, ScrollTrigger } from './lib/scroll'
import { usePointerTracking } from './lib/pointer'

/**
 * The evening, assembled. The atmosphere canvas lives behind everything and
 * re-grades per chapter; the loader lifts to reveal the hero; then the guest
 * walks the nine chapters as one uninterrupted cinematic scroll.
 */
export default function App() {
  const [ready, setReady] = useState(false)
  usePointerTracking()

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
        Skip to content
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
