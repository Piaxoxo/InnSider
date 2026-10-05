/**
 * Die Event-Anfrage liegt hinter einer Tür — wie das Reservierungswerkzeug.
 * Jeder Knopf im Haus, der nach einer Veranstaltung fragt, kann hier ziehen,
 * ohne zu wissen, wo das Formular hängt.
 */

type Listener = (open: boolean) => void

const listeners = new Set<Listener>()

export function openEnquiry() {
  listeners.forEach((l) => l(true))
}

export function closeEnquiry() {
  listeners.forEach((l) => l(false))
}

export function onEnquiry(l: Listener): () => void {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}
