import type { TransitionPhase } from '../lib/useRouteTransition'
import { site } from '../content/site'
import './page-transition.css'

/**
 * The curtain. A warm candlelit sheet that rises to cover the screen while the
 * route swaps beneath it, then lifts away — so navigation feels like the room
 * dimming and coming back up, never a hard cut. Purely presentational and
 * aria-hidden; the transition machine in useRouteTransition drives the phase.
 */
export function PageTransition({ phase }: { phase: TransitionPhase }) {
  return (
    <div className={`ptrans ptrans--${phase}`} aria-hidden="true">
      <div className="ptrans__sheet">
        <span className="ptrans__mark">{site.wordmark}</span>
      </div>
    </div>
  )
}
