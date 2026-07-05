/**
 * The film — real cinematic footage as the visual language.
 *
 * Each shot is a full-bleed native <video> (pixel-sharp, hardware-decoded). The
 * sequence is data-driven: drop more clips in public/media/film and add them
 * here; the scroll-driven dissolves and Ken-Burns adapt automatically.
 */
const B = import.meta.env.BASE_URL

export interface Shot {
  id: string
  src: string
  portrait: boolean
}

export const SHOTS: Shot[] = [
  { id: 'shot-01', src: `${B}media/film/shot-01.mp4`, portrait: false },
  { id: 'shot-02', src: `${B}media/film/shot-02.mp4`, portrait: true },
  { id: 'shot-03', src: `${B}media/film/shot-03.mp4`, portrait: true },
]
