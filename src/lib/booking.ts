/**
 * The reservation tool lives behind a door.
 *
 * The booking app is a separate application with its own look; embedding it
 * raw broke the evening's atmosphere. So it stays closed until a guest asks
 * for it, and then opens inside a frame of our own. Any "Reservieren" in the
 * house — the chapter, the floating action, the navigation — can pull this
 * handle without having to know where the overlay lives.
 */

type Listener = (open: boolean) => void

const listeners = new Set<Listener>()

export function openBooking() {
  listeners.forEach((l) => l(true))
}

export function closeBooking() {
  listeners.forEach((l) => l(false))
}

export function onBooking(l: Listener): () => void {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}
