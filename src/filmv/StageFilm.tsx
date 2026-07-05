import { useEffect, useRef } from 'react'
import { ScrollTrigger, initSmoothScroll, startScroll } from '../lib/scroll'
import { prefersReducedMotion } from '../lib/useReducedMotion'
import { navigate } from '../lib/useRoute'
import { SHOTS } from './shots'
import './stagefilm.css'

/**
 * THE FILM. Real restaurant footage, full-bleed, controlled by scrolling.
 *
 * Native <video> layers are the cinematography (sharp, hardware-decoded — no
 * WebGL softness). Scroll drives one continuous playhead across the shots: each
 * shot slowly drifts and zooms (Ken Burns) while it holds, then dissolves into
 * the next through a warm light-leak — a filmic wash, not a UI fade. A cinema
 * grade (contrast, warmth), vignette and film grain sit over everything.
 *
 * No words, no sections — only the evening. This is the visual foundation the
 * chapters will later live inside.
 */
export function StageFilm() {
  const root = useRef<HTMLDivElement>(null)
  const leak = useRef<HTMLDivElement>(null)
  const wraps = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const teardown = initSmoothScroll()
    startScroll()
    const reduced = prefersReducedMotion()
    const N = SHOTS.length
    const videoOf = (i: number) => wraps.current[i]?.querySelector('video') as HTMLVideoElement | null
    const play = (v: HTMLVideoElement | null) => v && v.paused && v.play().catch(() => {})
    const pause = (v: HTMLVideoElement | null) => v && !v.paused && v.pause()

    if (!reduced) play(videoOf(0))

    const update = (progress: number) => {
      const p = progress * (N - 1)
      wraps.current.forEach((wrap, i) => {
        if (!wrap) return
        const d = p - i
        const ad = Math.abs(d)
        // Narrow dwell + wide feather → a true cross-dissolve (both ~0.5 at the seam).
        const op = Math.max(0, Math.min(1, 1 - (ad - 0.3) / 0.5))
        wrap.style.opacity = String(op)
        const v = videoOf(i)
        if (reduced) {
          wrap.style.transform = 'scale(1.03)'
        } else {
          const life = (d + 1) / 2 // 0 (entering) → 1 (leaving)
          const scale = 1.12 - life * 0.1
          const dir = i % 2 ? -1 : 1
          wrap.style.transform = `scale(${scale.toFixed(4)}) translate3d(${(dir * life * 1.1).toFixed(2)}%, ${(-life * 0.7).toFixed(2)}%, 0)`
          if (ad < 1.05) play(v)
          else pause(v)
        }
      })
      // Warm light-leak peaks at the seam between two shots (fracp ≈ 0.5),
      // not during the holds — the dissolve is washed with warm light.
      const fracp = p - Math.floor(p)
      const lk = Math.max(0, 1 - Math.abs(fracp - 0.5) / 0.22)
      if (leak.current) leak.current.style.opacity = String(lk * 0.5)
    }

    const st = reduced
      ? null
      : ScrollTrigger.create({
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          onUpdate: (self) => update(self.progress),
        })

    update(0)
    requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => {
      st?.kill()
      teardown()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="filmv" ref={root} style={{ height: `${SHOTS.length * 140}vh` }}>
      <div className="filmv__stage">
        {SHOTS.map((s, i) => (
          <div
            className="filmv__shot"
            key={s.id}
            ref={(el) => {
              if (el) wraps.current[i] = el
            }}
          >
            <video
              className={`filmv__video ${s.portrait ? 'is-portrait' : ''}`}
              src={s.src}
              muted
              loop
              playsInline
              preload={i === 0 ? 'auto' : 'metadata'}
            />
          </div>
        ))}

        <div className="filmv__grade" />
        <div className="filmv__leak" ref={leak} />
        <div className="filmv__grain" />
        <div className="filmv__vignette" />
      </div>

      <button className="filmv__back" onClick={() => navigate('')} aria-label="Zurück">
        <span aria-hidden="true">←</span>
      </button>
      <div className="filmv__cue" aria-hidden="true">
        <span className="filmv__cue-line" />
      </div>
      <div className="filmv__ambience" aria-hidden="true">
        <span className="filmv__dot" />
        Ambiente · bald
      </div>
    </div>
  )
}
