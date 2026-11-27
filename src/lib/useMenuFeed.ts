import { useEffect, useState } from 'react'
import { readFeed, type FeedResult } from './menuFeed'

/**
 * Die Karte von der Quelle holen.
 *
 * Nur das Holen steckt hier — das Prüfen liegt in `menuFeed.ts` und läuft
 * ohne Netz. Was dieses Modul dazu beiträgt, sind die drei Dinge, die beim
 * Holen schiefgehen: die Quelle antwortet nicht, sie antwortet langsam, oder
 * sie antwortet mit etwas, das kein JSON ist.
 *
 * Alle drei enden gleich: es wird nichts übernommen, und die Seite zeigt
 * weiter den Stand aus `site.ts`, der gegen die Blätter geprüft ist. Die
 * Quelle überschreibt, sie ersetzt nicht. Darum wird auch nichts angezeigt,
 * solange geholt wird — kein Platzhalter, kein Springen: der Gast sieht von
 * Anfang an eine vollständige Karte, und wenn die Quelle etwas Neueres hat,
 * tritt es an ihre Stelle.
 */

/** Die Reservierungs-App des Hauses. Sie führt die Karte. */
const APP_FEED = 'https://innsider-reservierung.vercel.app/api/web'

/**
 * Wo die Karte liegt.
 *
 * Standardmäßig die App. Keine geheime Adresse, kein Zugangsschlüssel — ein
 * öffentlicher Endpunkt desselben Hauses, der im Programm stehen darf.
 *
 * `VITE_MENU_FEED` übersteuert sie: eine andere Adresse zum Ausprobieren, oder
 * eine leere Angabe, um das Holen ganz abzuschalten. Dann zeigt die Seite den
 * Stand aus `site.ts` — der Weg zurück, falls mit der App etwas ist.
 */
export const FEED_URL: string = import.meta.env.VITE_MENU_FEED ?? APP_FEED

/** Länger als das darf es nicht dauern; danach bleibt der eigene Stand. */
const TIMEOUT_MS = 4000

const NOTHING: FeedResult = { weekly: null, sections: null, stand: null }

export function useMenuFeed(): FeedResult {
  const [feed, setFeed] = useState<FeedResult>(NOTHING)

  useEffect(() => {
    if (!FEED_URL) return

    // Abbruch bei Zeitüberschreitung und beim Verlassen der Seite: eine
    // Antwort, die nach dem Abräumen eintrifft, darf nichts mehr setzen.
    const ctl = new AbortController()
    const timer = window.setTimeout(() => ctl.abort(), TIMEOUT_MS)
    let alive = true

    fetch(FEED_URL, { signal: ctl.signal, headers: { accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (!alive) return
        const read = readFeed(data)
        // Nur setzen, wenn wirklich etwas Brauchbares dabei ist — sonst bleibt
        // der eigene Stand, ohne einen Zustandswechsel auszulösen.
        if (read.weekly || read.sections) setFeed(read)
      })
      .catch(() => {
        // Absichtlich still. Ein Gast kann mit einer ausgefallenen Quelle
        // nichts anfangen, und die Karte steht ja.
      })
      .finally(() => window.clearTimeout(timer))

    return () => {
      alive = false
      window.clearTimeout(timer)
      ctl.abort()
    }
  }, [])

  return feed
}
