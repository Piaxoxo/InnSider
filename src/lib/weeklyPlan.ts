import { useEffect, useState } from 'react'
import { weekly } from '../content/site'
import { viennaNow } from './vienna'

/**
 * Welcher Mittagsaushang hängt gerade?
 *
 * Die Karten liegen in `weekly.plan` mit je einem eigenen Fenster vor. Hier
 * wird nur ausgewählt — es gewinnt die jüngste Karte, deren Startzeit schon
 * vorbei ist und deren letzter Gültigkeitstag noch nicht. So löst die neue
 * Woche die alte punktgenau zur hinterlegten Uhrzeit ab, und niemand muss
 * dafür am Freitagnachmittag an der Website sitzen.
 *
 * Gerechnet wird in Wiener Zeit: der Aushang hängt im Lokal, nicht auf dem
 * Gerät des Gastes.
 */

export type WeeklySheet = (typeof weekly.plan)[number]

/** Null, wenn keine Karte gilt — Wochenende, oder die nächste fehlt noch. */
export function currentSheet(): WeeklySheet | null {
  const now = viennaNow()
  // Ohne verlässliche Uhr lieber den Hinweis als die falsche Woche.
  if (!now) return null

  let best: WeeklySheet | null = null
  for (const sheet of weekly.plan) {
    if (now.stamp < sheet.from) continue // hängt noch nicht
    if (now.date > sheet.until) continue // abgelaufen
    if (!best || sheet.from > best.from) best = sheet
  }
  return best
}

/**
 * Dasselbe, aber mitlaufend: wer die Seite über den Wechsel hinweg offen hat,
 * sieht die neue Karte ohne neu zu laden. Einmal pro Minute genügt.
 */
export function useCurrentSheet(): WeeklySheet | null {
  const [sheet, setSheet] = useState(currentSheet)

  useEffect(() => {
    const id = window.setInterval(() => {
      const next = currentSheet()
      setSheet((prev) => (prev === next ? prev : next))
    }, 60_000)
    return () => window.clearInterval(id)
  }, [])

  return sheet
}
