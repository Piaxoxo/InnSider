/**
 * Die Uhr des Hauses.
 *
 * Alles, was auf der Seite von „jetzt" abhängt — ob offen ist, welcher
 * Mittagsaushang gilt — muss sich nach Wien richten und nicht nach dem Gerät
 * des Gastes. Wer aus München, Zürich oder dem Urlaub schaut, will wissen,
 * was im Lokal los ist, nicht wie spät es bei ihm selbst ist.
 *
 * Eine Stelle, zwei Nutzer: das Öffnungszeiten-Band und die Wochenkarte.
 */

export interface ViennaNow {
  /** 0 = Sonntag … 6 = Samstag, wie bei Date.getDay(). */
  day: number
  /** Minuten seit Mitternacht. */
  minutes: number
  /** Datum als YYYY-MM-DD. */
  date: string
  /** Datum und Uhrzeit als YYYY-MM-DDTHH:MM — direkt mit Strings vergleichbar. */
  stamp: string
}

/**
 * Null, wenn die Zeitzone nicht zu ermitteln ist. Die Aufrufer zeigen dann
 * lieber gar keine Aussage als eine falsche.
 */
export function viennaNow(): ViennaNow | null {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Vienna',
      weekday: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      // h23 statt hour12:false — sonst liefern manche Engines um Mitternacht 24.
      hourCycle: 'h23',
    }).formatToParts(new Date())

    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
    const days: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
    const day = days[get('weekday')]
    if (day === undefined) return null

    const date = `${get('year')}-${get('month')}-${get('day')}`
    const hh = get('hour')
    const mm = get('minute')
    if (!get('year') || !hh) return null

    return {
      day,
      minutes: Number(hh) * 60 + Number(mm),
      date,
      stamp: `${date}T${hh}:${mm}`,
    }
  } catch {
    return null
  }
}
