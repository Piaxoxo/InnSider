import { useEffect, useState } from 'react'
import { hours } from '../content/site'
import { viennaNow } from '../lib/vienna'
import './hours.css'

/**
 * Die Öffnungszeiten, direkt unter dem Auftakt.
 *
 * Nach dem Partikelglas ist das die erste Frage, die ein Gast an ein Lokal
 * hat — noch vor der Geschichte, noch vor der Karte. Deshalb steht sie hier
 * und nicht erst im letzten Kapitel.
 *
 * Der Status wird in Wiener Zeit gerechnet, nicht in der des Besuchers. Wer
 * aus München oder von weiter weg schaut, soll sehen, ob das Lokal gerade
 * offen hat — nicht, wie spät es bei ihm selbst ist.
 */

const MIN = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function isOpenNow(): boolean | null {
  const now = viennaNow()
  if (!now) return null
  const today = hours.week[now.day]
  if (!today) return null
  return now.minutes >= MIN(today.open) && now.minutes < MIN(today.close)
}

export function Hours() {
  const [open, setOpen] = useState<boolean | null>(null)

  useEffect(() => {
    const tick = () => setOpen(isOpenNow())
    tick()
    // Einmal pro Minute reicht — die Anzeige soll stimmen, nicht ticken.
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <aside className="hours" aria-label={hours.label}>
      <div className="hours__inner">
        <span className="hours__label meta">{hours.label}</span>

        <div className="hours__groups">
          {hours.groups.map((g) => (
            <div className="hours__group" key={g.days}>
              <span className="hours__days">{g.days}</span>
              <span className="hours__time">{g.time}</span>
              <span className="hours__kinds">{g.kinds}</span>
            </div>
          ))}
        </div>

        <div className="hours__side">
          <span className="hours__kitchen">{hours.kitchenNote}</span>
          {open !== null && (
            <span className={`hours__state ${open ? 'is-open' : ''}`}>
              <span className="hours__dot" aria-hidden="true" />
              {open ? hours.openLabel : hours.closedLabel}
            </span>
          )}
        </div>
      </div>
    </aside>
  )
}
