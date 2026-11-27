import type { MenuItem, MenuSection, WeeklyCard } from '../content/site'
import { menu as localMenu } from '../content/site'

/**
 * Die Karte aus der App.
 *
 * Was die App schickt, steht auf der Seite — wörtlich. Kein Umschreiben, kein
 * Zurechtbiegen, keine Prüfung des Inhalts: die App ist die Karte, die Seite
 * zeigt sie. Schreibt die App „ACGO" zusammen, steht „ACGO" auf der Seite;
 * schreibt sie „18.40" mit Punkt, steht ein Punkt da. Das ist so gewollt, denn
 * zwei Stellen, die denselben Inhalt verschieden schreiben, sind schlimmer als
 * eine Stelle, die ihn allein verantwortet.
 *
 * Was hier trotzdem passiert, ist nur Auspacken: die App legt Name, Beilage
 * und Allergene je Gericht in **eine** Zeichenkette, getrennt durch einen
 * Strich und ein angehängtes Buchstabenkürzel. Dieses Modul schneidet sie
 * auseinander, damit die drei Teile an ihre Stelle im Satz kommen. Dabei geht
 * kein Zeichen verloren: was nicht sicher als Kürzel zu erkennen ist, bleibt
 * im Text.
 *
 * Geprüft wird einzig, ob überhaupt etwas angekommen ist. Fällt die App aus
 * oder ist sie nicht erreichbar, bleibt der letzte eingetragene Stand stehen
 * — eine leere Speisekarte hilft keinem Gast.
 *
 * Lesen und Holen sind getrennt: hier steht das Lesen, es läuft ohne Netz und
 * ohne Browser und ist damit prüfbar. Das Holen liegt in `useMenuFeed.ts`.
 */

// ── Die Form, wie die App sie schickt ──────────────────────────────────────

export interface FeedPayload {
  ok?: unknown
  menu?: {
    week?: unknown
    time?: unknown
    price?: unknown
    /** Name und Kürzel in einem: „Mais-Chilisuppe G". */
    soup?: unknown
    /** Je Teller „Name|Beilagen Kürzel". */
    dishes?: unknown
  }
  karte?: unknown
  stand?: unknown
}

export interface FeedResult {
  weekly: WeeklyCard | null
  sections: readonly MenuSection[] | null
  /** Was die App als Stand ihrer Antwort angibt, unverändert. */
  stand: string | null
}

/** Nichts angekommen — die Aufrufer bleiben dann beim eigenen Stand. */
const NOTHING: FeedResult = { weekly: null, sections: null, stand: null }

// ── Auspacken ──────────────────────────────────────────────────────────────

/**
 * Die Buchstaben, die als Allergenkürzel in Frage kommen.
 *
 * Sie entscheiden hier **nicht**, was gültig ist — sie entscheiden nur, wo
 * geschnitten wird. Ein Gericht, das auf einen anderen Großbuchstaben endet,
 * behält ihn im Namen, statt ihn als Kürzel zu verlieren. Nichts wird
 * verworfen, nur zugeordnet.
 */
const ALLERGENS = new Set(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'L', 'M', 'N', 'O', 'P', 'R'])

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '')

/**
 * Schneidet das angehängte Kürzel vom Text.
 *
 * Das Kürzel wird **so weitergegeben, wie es kommt** — „ACGO" bleibt „ACGO",
 * „A C G" bleibt „A C G". Die Seite schreibt es nicht um.
 */
export function splitAllergens(line: string): { text: string; allergens: string } {
  const m = line.trim().match(/^(.*?)[\s]{1,}([A-Z](?:\s*[A-Z])*)$/)
  if (!m) return { text: line.trim(), allergens: '' }
  const letters = m[2].replace(/\s+/g, '').split('')
  if (!letters.length || !letters.every((c) => ALLERGENS.has(c))) {
    // Nicht sicher als Kürzel zu erkennen: bleibt im Text, wo es stand.
    return { text: line.trim(), allergens: '' }
  }
  return { text: m[1].trim(), allergens: m[2].trim() }
}

// ── Die Mittagsteller ──────────────────────────────────────────────────────

function readWeekly(m: FeedPayload['menu']): WeeklyCard | null {
  if (!m || typeof m !== 'object') return null

  const week = str(m.week)
  const soup = str(m.soup)
  const dishes = Array.isArray(m.dishes) ? m.dishes.map(str).filter(Boolean) : []
  // Ohne Woche, ohne Suppe oder ohne einen einzigen Teller gibt es nichts
  // anzuzeigen. Das ist keine Beurteilung des Inhalts, sondern das Fehlen von
  // Inhalt.
  if (!week || !soup || dishes.length === 0) return null

  const s = splitAllergens(soup)
  const mains = dishes.map((line) => {
    // Der Strich trennt Name und Beilage; das Kürzel hängt hinten.
    const [rawName, ...rest] = line.split('|')
    if (!rest.length) {
      const bare = splitAllergens(rawName)
      return { name: bare.text, note: '', allergens: bare.allergens }
    }
    const tail = splitAllergens(rest.join('|'))
    return { name: rawName.trim(), note: tail.text, allergens: tail.allergens }
  })

  const time = str(m.time)
  const price = str(m.price)

  return {
    period: week,
    starter: { name: s.text, note: '', allergens: s.allergens },
    mains,
    // Beide genau so, wie die App sie schreibt. Fehlen sie, gilt die Angabe
    // des Hauses aus site.ts.
    hours: time || undefined,
    price: price || undefined,
  }
}

// ── Die Karte ──────────────────────────────────────────────────────────────

/**
 * Welche Abteilung in welche Spalte gehört, bleibt hier.
 *
 * Das ist Satz, nicht Inhalt: „Hauptspeisen" ist für sich länger als alles
 * Übrige zusammen, ein automatischer Umbruch ließe eine Spalte halb leer. Die
 * App bestimmt, was auf der Karte steht, nicht wie die Seite es bricht.
 * Abteilungen, die sie noch nicht kennt, landen in Spalte eins.
 */
function columnFor(title: string): 1 | 2 {
  const known = localMenu.sections.find((s) => s.title.toLowerCase() === title.toLowerCase())
  return (known?.column as 1 | 2) ?? 1
}

function readSections(raw: unknown): readonly MenuSection[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null

  const out: MenuSection[] = []
  for (const g of raw) {
    if (!g || typeof g !== 'object') continue
    const title = str((g as { group?: unknown }).group)
    const items = (g as { items?: unknown }).items
    if (!title || !Array.isArray(items)) continue

    const read: MenuItem[] = []
    for (const it of items) {
      const o = (it ?? {}) as Record<string, unknown>
      const name = str(o.n)
      if (!name) continue
      read.push({
        name,
        note: str(o.d),
        // Alles unverändert übernommen: Preis wie geschrieben, Kürzel wie
        // geschrieben, Zuschläge in der Reihenfolge der App.
        price: str(o.p),
        allergens: str(o.a),
        plus: Array.isArray(o.x) ? o.x.map(str).filter(Boolean).join(' · ') : '',
      })
    }
    if (read.length) out.push({ title, column: columnFor(title), items: read })
  }
  return out.length ? out : null
}

// ── Der Einstieg ───────────────────────────────────────────────────────────

/**
 * Packt aus, was die App geschickt hat.
 *
 * `ok: false` ist die Auskunft der App über sich selbst — sagt sie, dass ihre
 * Antwort nicht taugt, wird sie nicht genommen. Alles andere wird genommen.
 * Teller und Karte getrennt: fehlt das eine, kommt das andere trotzdem an.
 */
export function readFeed(data: unknown): FeedResult {
  if (!data || typeof data !== 'object') return NOTHING
  const p = data as FeedPayload
  if (p.ok === false) return NOTHING

  return {
    weekly: readWeekly(p.menu),
    sections: readSections(p.karte),
    stand: str(p.stand) || null,
  }
}
