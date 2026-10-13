import { nav } from '../content/site'

/**
 * Wo im Abend man gerade steht — nach Kapiteln, nicht nach Seitenhöhe.
 *
 * Die Farbstimmung des Raums lief bisher über den rohen Scrollfortschritt:
 * 0 am Seitenanfang, 1 am Ende, linear dazwischen. Das wäre richtig, wenn alle
 * Kapitel gleich hoch wären. Sie sind es nicht — die Galerie allein ist über
 * zehn Bildschirme lang, der Auftakt einen. In der Folge lag die blaue Stunde
 * der Bar irgendwo im Küchenkapitel und die Kerzenwärme des Finales mitten in
 * der Galerie: Jedes Kapitel bekam die Farbe eines anderen.
 *
 * Hier wird stattdessen gemessen, welches Kapitel tatsächlich im Blick ist.
 * Zurück kommt wieder ein Wert von 0 bis 1 — nur meint er jetzt „Kapitel eins
 * bis Kapitel neun" statt „oben bis unten".
 */

let centers: number[] = []
let measuredAt = -1

function measure() {
  const next: number[] = []
  for (const n of nav) {
    const el = document.getElementById(n.id)
    if (!el) continue
    const r = el.getBoundingClientRect()
    next.push(r.top + window.scrollY + r.height / 2)
  }
  centers = next
  measuredAt = document.documentElement.scrollHeight
}

export function chapterProgress(): number {
  if (typeof document === 'undefined') return 0

  // Neu vermessen, wenn sich die Seitenhöhe geändert hat — Fotos und fixierte
  // Abschnitte lassen sie nach dem Laden noch wachsen.
  if (centers.length < 2 || document.documentElement.scrollHeight !== measuredAt) {
    measure()
    if (centers.length < 2) return 0
  }

  const eye = window.scrollY + window.innerHeight / 2
  const last = centers.length - 1

  if (eye <= centers[0]) return 0
  if (eye >= centers[last]) return 1

  for (let i = 0; i < last; i++) {
    const a = centers[i]
    const b = centers[i + 1]
    if (eye >= a && eye <= b) {
      const f = b > a ? (eye - a) / (b - a) : 0
      return (i + f) / last
    }
  }
  return 1
}
