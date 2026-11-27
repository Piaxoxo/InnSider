import type { MenuItem, MenuSection, WeeklySheet } from '../content/site'
import { menu as localMenu } from '../content/site'

/**
 * Die Karte aus einer fremden Quelle.
 *
 * Die Quelle liefert einen Umschlag mit `ok`, den Mittagstellern, der Karte
 * und einem `stand`. Was hier passiert, ist absichtlich zweigeteilt: dieses
 * Modul liest und prüft nur, es holt nichts. Das Holen steckt in
 * `useMenuFeed` — so lässt sich das Prüfen ohne Netz und ohne Browser testen,
 * und genau daran liegt hier alles.
 *
 * Grundregel: die Quelle überschreibt, sie ersetzt nicht. Fehlt sie, kommt sie
 * zu spät oder liefert etwas Zweifelhaftes, bleibt der geprüfte Stand aus
 * `site.ts` stehen. Eine Speisekarte, die leer lädt, ist schlimmer als eine,
 * die eine Stunde alt ist — und bei Allergenen ist Stillschweigen keine
 * Option. Deshalb wird hier im Zweifel abgelehnt, nicht gerettet.
 */

// ── Die Form, wie die Quelle sie schickt ───────────────────────────────────

export interface FeedPayload {
  ok?: unknown
  menu?: {
    week?: unknown
    time?: unknown
    price?: unknown
    /** Name und Allergene in einem: „Mais-Chilisuppe G". */
    soup?: unknown
    /** Je Teller „Name|Beilagen Allergene". */
    dishes?: unknown
  }
  karte?: unknown
  stand?: unknown
}

export interface FeedResult {
  weekly: WeeklySheet | null
  sections: readonly MenuSection[] | null
  /** Wann die Quelle den Stand gesetzt hat, als YYYY-MM-DDTHH:MM Wiener Zeit. */
  stand: string | null
}

/** Nichts Brauchbares dabei — die Aufrufer bleiben dann beim eigenen Stand. */
const NOTHING: FeedResult = { weekly: null, sections: null, stand: null }

/**
 * Wie alt der `stand` einer Antwort höchstens sein darf.
 *
 * Die Mittagsteller tragen ihr Fenster im Wochentext und laufen von selbst ab.
 * Die Karte tut das nicht: sie hat kein Gültigkeitsdatum, also würde eine
 * vergessene Quelle sie endlos ausliefern — mit Preisen von irgendwann. Der
 * `stand` ist das einzige, woran sich erkennen lässt, ob überhaupt noch jemand
 * nach der Quelle schaut, denn eine lebende Quelle setzt ihn bei jeder Antwort
 * neu. Vierzehn Tage sind reichlich: die Karte ändert sich selten, aber nicht
 * seltener, als jemand nach ihr sieht.
 */
const MAX_AGE_DAYS = 14

// ── Kleinteile ─────────────────────────────────────────────────────────────

/**
 * Die Buchstaben, die auf den Blättern des Hauses vorkommen. Alles andere ist
 * kein Allergen, sondern ein Tippfehler, und ein Tippfehler in dieser Spalte
 * darf nicht durchgehen.
 */
const ALLERGENS = new Set(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'L', 'M', 'N', 'O', 'P', 'R'])

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '')

/**
 * Trennt die Allergene vom Namen.
 *
 * Die Quelle hängt sie hinten an, mal gesperrt („A C G"), mal zusammen
 * („ACGO"). Genommen wird nur, was restlos aus bekannten Buchstaben besteht —
 * sonst gilt die ganze Zeile als Text. Lieber ein Gericht ohne Allergenspalte
 * als eines, bei dem ein Wortende als Allergen gelesen wird.
 */
export function splitAllergens(line: string): { text: string; allergens: string } {
  const m = line.trim().match(/^(.*?)[\s]{1,}([A-Z](?:\s*[A-Z])*)$/)
  if (!m) return { text: line.trim(), allergens: '' }
  const letters = m[2].replace(/\s+/g, '').split('')
  if (!letters.length || !letters.every((c) => ALLERGENS.has(c))) {
    return { text: line.trim(), allergens: '' }
  }
  // Immer gesperrt ausgeben, egal wie die Quelle es schreibt: auf der Seite
  // steht „A C G" und soll überall gleich aussehen.
  return { text: m[1].trim(), allergens: letters.join(' ') }
}

/**
 * Eine Angabe, die nur Allergene enthält — in der Karte steht sie in einem
 * eigenen Feld („ACGO"). Leer, sobald ein unbekannter Buchstabe dabei ist.
 */
export function onlyAllergens(v: string): string {
  const letters = v.replace(/\s+/g, '').split('')
  if (!letters.length) return ''
  if (!letters.every((c) => ALLERGENS.has(c))) return ''
  return letters.join(' ')
}

/** Preise nur in der Form, die auf der Karte steht: „13,50", „5,80". */
function price(v: unknown): string | null {
  const s = str(v)
  return /^\d{1,3},\d{2}$/.test(s) ? s : null
}

const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

/**
 * Holt den letzten Gültigkeitstag aus dem Freitext der Woche.
 *
 * Die Quelle schickt „Montag 23. November bis Freitag 27. November" und kein
 * `until`. Ohne einen letzten Tag könnte eine stehengebliebene Quelle die
 * vergangene Woche endlos anzeigen — das ist genau der Fehler, den die Seite
 * nicht machen soll. Also wird er hier gelesen.
 *
 * Das Jahr steht nicht im Text und kommt aus `stand`. Läuft die Woche über
 * den Jahreswechsel, liegt der Endtag im Januar nach einem Dezember-Stand;
 * dieser Fall wird mitgerechnet, statt auf ein falsches Jahr zu laufen.
 */
export function untilFromWeek(week: string, standISO: string): string | null {
  const parts = week.split(/\s+bis\s+/i)
  if (parts.length !== 2) return null

  const end = parts[1].match(/(\d{1,2})\.\s*([A-Za-zÄÖÜäöü]+)/)
  const begin = parts[0].match(/(\d{1,2})\.\s*([A-Za-zÄÖÜäöü]+)/)
  if (!end || !begin) return null

  const month = MONTHS.findIndex((m) => m.toLowerCase() === end[2].toLowerCase())
  const startMonth = MONTHS.findIndex((m) => m.toLowerCase() === begin[2].toLowerCase())
  if (month < 0 || startMonth < 0) return null

  const day = Number(end[1])
  if (day < 1 || day > 31) return null

  const stand = new Date(standISO)
  if (Number.isNaN(stand.getTime())) return null

  // Dezember-Stand, Januar-Endtag: die Woche reicht ins neue Jahr.
  let year = stand.getUTCFullYear()
  if (stand.getUTCMonth() === 11 && month === 0) year += 1
  // Und umgekehrt, falls ein Stand aus dem Januar auf eine Dezemberwoche zeigt.
  if (stand.getUTCMonth() === 0 && month === 11) year -= 1

  const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  // Gegenprobe: existiert der Tag überhaupt? Der 31. November nicht.
  const probe = new Date(`${iso}T12:00:00Z`)
  if (probe.getUTCDate() !== day || probe.getUTCMonth() !== month) return null
  return iso
}

/** `stand` als YYYY-MM-DDTHH:MM in Wiener Zeit — vergleichbar mit lib/vienna. */
function standStamp(v: unknown): string | null {
  const s = str(v)
  if (!s) return null
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return null
  try {
    const p = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Vienna',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(d)
    const g = (t: string) => p.find((x) => x.type === t)?.value ?? ''
    return `${g('year')}-${g('month')}-${g('day')}T${g('hour')}:${g('minute')}`
  } catch {
    return null
  }
}

// ── Die Mittagsteller ──────────────────────────────────────────────────────

function readWeekly(m: FeedPayload['menu'], standISO: unknown): WeeklySheet | null {
  if (!m || typeof m !== 'object') return null

  const week = str(m.week)
  const soup = str(m.soup)
  const dishes = Array.isArray(m.dishes) ? m.dishes.map(str).filter(Boolean) : []
  if (!week || !soup || dishes.length === 0) return null

  const until = untilFromWeek(week, str(standISO))
  if (!until) return null

  const s = splitAllergens(soup)
  if (!s.text) return null
  // Die Quelle hat für die Suppe kein eigenes Feld für die Beilagenzeile —
  // was dort steht, ist der Name. Auf den Blättern ist das meist auch so
  // („Mais-Chilisuppe", „Zucchinicremesuppe mit Dille").
  const starter = { name: s.text, note: '', allergens: s.allergens }

  const mains = dishes.map((line) => {
    // Der Strich trennt Name und Beilagen; die Allergene hängen hinten.
    const [rawName, ...rest] = line.split('|')
    const tail = splitAllergens(rest.join('|'))
    const bare = splitAllergens(rawName)
    return rest.length
      ? { name: rawName.trim(), note: tail.text, allergens: tail.allergens }
      : { name: bare.text, note: '', allergens: bare.allergens }
  })
  if (mains.some((d) => !d.name)) return null

  return {
    period: week,
    // Die Quelle sagt nicht, ab wann der Aushang hängt. Ihr `stand` ist das
    // Beste, was sie dazu hat: ab dann liegt diese Woche vor.
    from: standStamp(standISO) ?? `${until}T00:00`,
    until,
    starter,
    mains,
  }
}

// ── Die Karte ──────────────────────────────────────────────────────────────

/**
 * Welche Abteilung in welche Spalte gehört, bleibt hier und kommt nicht aus
 * der Quelle: das ist Satz, nicht Inhalt. „Hauptspeisen" ist für sich länger
 * als alles Übrige zusammen, ein automatischer Umbruch ließe eine Spalte halb
 * leer. Unbekannte Abteilungen landen in Spalte eins.
 */
function columnFor(title: string): 1 | 2 {
  const known = localMenu.sections.find((s) => s.title.toLowerCase() === title.toLowerCase())
  return (known?.column as 1 | 2) ?? 1
}

function readSections(raw: unknown): readonly MenuSection[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null

  const out: MenuSection[] = []
  for (const g of raw) {
    if (!g || typeof g !== 'object') return null
    const title = str((g as { group?: unknown }).group)
    const items = (g as { items?: unknown }).items
    if (!title || !Array.isArray(items) || items.length === 0) return null

    const read: MenuItem[] = []
    for (const it of items) {
      const o = (it ?? {}) as Record<string, unknown>
      const name = str(o.n)
      if (!name) return null

      // Ein Gericht ohne Preis gibt es („Hausgemachter Kuchen oder Desserts"),
      // ein Gericht mit unlesbarem Preis nicht.
      const raw = str(o.p)
      const p = raw === '' ? '' : price(o.p)
      if (p === null) return null

      const a = str(o.a)
      const allergens = a === '' ? '' : onlyAllergens(a)
      // Buchstaben, die kein Allergen des Hauses sind, sind ein Fehler in der
      // Quelle und keine Spalte, die man raten darf.
      if (a !== '' && allergens === '') return null

      read.push({
        name,
        note: str(o.d),
        price: p,
        allergens,
        plus: Array.isArray(o.x) ? o.x.map(str).filter(Boolean).join(' · ') : '',
      })
    }

    out.push({ title, column: columnFor(title), items: read })
  }
  return out
}

// ── Der Einstieg ───────────────────────────────────────────────────────────

/**
 * Prüft, was die Quelle geschickt hat.
 *
 * Abgelehnt wird komplett, sobald ein Teil nicht stimmt — und zwar getrennt
 * für Teller und Karte: eine kaputte Karte soll nicht die Teller mitnehmen.
 * Was abgelehnt wird, kommt als `null` zurück; dort bleibt dann der eigene,
 * gegen die Blätter geprüfte Stand stehen.
 */
export function readFeed(data: unknown): FeedResult {
  if (!data || typeof data !== 'object') return NOTHING
  const p = data as FeedPayload
  // `ok: true` ist die Zusage der Quelle, dass die Antwort vollständig ist.
  // Ohne sie wird nichts übernommen, auch wenn Felder gefüllt aussehen.
  if (p.ok !== true) return NOTHING

  const stand = str(p.stand)
  const age = Date.now() - new Date(stand).getTime()
  // Unlesbarer, fehlender oder in der Zukunft liegender `stand`: nicht
  // übernehmen. Ohne verlässliches Datum ist nicht zu beurteilen, ob diese
  // Antwort von heute ist oder von einem abgeschalteten Dienst.
  if (!stand || Number.isNaN(age) || age < 0 || age > MAX_AGE_DAYS * 86400_000) return NOTHING

  return {
    weekly: readWeekly(p.menu, p.stand),
    sections: readSections(p.karte),
    stand: standStamp(p.stand),
  }
}
