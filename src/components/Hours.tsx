import { useEffect, useState } from 'react'
import { hours } from '../content/site'
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

/** Wochentag und Minute seit Mitternacht, in Wien. */
function viennaNow(): { day: number; minutes: number } | null {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Vienna',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      // h23 statt hour12:false — sonst liefern manche Engines um Mitternacht 24.
      hourCycle: 'h23',
    }).formatToParts(new Date())

    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
    const days: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
    const day = days[get('weekday')]
    if (day === undefined) return null
    return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) }
  } catch {
    // Ohne verlässliche Zeitzone lieber gar keine Aussage als eine falsche.
    return null
  }
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
