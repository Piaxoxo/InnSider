import { useEffect, useState } from 'react'

/**
 * Tiny hash router — no dependency, and it survives GitHub Pages refreshes
 * (the hash never hits the server). Routes: '' (home), 'impressum', 'agb',
 * 'stage' (the 3-D film set).
 */
export type Route = '' | 'impressum' | 'agb' | 'stage'

function parse(): Route {
  const h = window.location.hash.replace(/^#\/?/, '').toLowerCase()
  return h === 'impressum' || h === 'agb' || h === 'stage' ? h : ''
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
