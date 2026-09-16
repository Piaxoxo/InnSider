import { useEffect, useState } from 'react'

/**
 * Tiny hash router — no dependency, and it survives GitHub Pages refreshes
 * (the hash never hits the server). Routes: '' (home), 'impressum', 'agb',
 * 'stage' (the 3-D film set).
 */
export type Route = '' | 'impressum' | 'agb' | 'datenschutz' | 'stage'

const ROUTES: Route[] = ['impressum', 'agb', 'datenschutz', 'stage']

function parse(): Route {
  const h = window.location.hash.replace(/^#\/?/, '').toLowerCase()
  return (ROUTES as string[]).includes(h) ? (h as Route) : ''
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => (typeof window === 'undefined' ? '' : parse()))
  useEffect(() => {
    const onHash = () => {
      setRoute(parse())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return route
}

export function navigate(route: Route) {
  window.location.hash = route ? `/${route}` : '/'
}

/**
 * Chapter anchors the evening can be deep-linked to (#menu, #reservation …).
 * These are not routes — they all render the home page and then scroll. It lets
 * one embed snippet serve every page of a host site: the host passes the
 * chapter in the hash, the evening opens there.
 */
const SECTIONS = [
  'hero',
  'dream',
  'bridge',
  'kitchen',
  'menu',
  'bar',
  'evening',
  'gallery',
  'events',
  'reservation',
]

/** The chapter the current URL points at, or null when it names no chapter. */
export function deepLinkSection(): string | null {
  if (typeof window === 'undefined') return null
  const h = window.location.hash.replace(/^#\/?/, '').toLowerCase()
  return SECTIONS.includes(h) ? h : null
}
