/**
 * Ambient sound — user-controlled only, never autoplayed.
 *
 * No audio file is shipped yet, so this synthesises a soft, warm "room tone"
 * with the Web Audio API: a low detuned drone, a breath of filtered air, and a
 * slow swell — enough to suggest a candlelit room without a loud loop.
 *
 * TO USE A REAL AMBIENCE TRACK later: drop `/media/ambience.mp3` and set
 * `AMBIENCE_TRACK` below; play()/stop() will crossfade the file instead.
 */

const AMBIENCE_TRACK: string | null = null // e.g. '/media/ambience.mp3'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let nodes: AudioNode[] = []
let el: HTMLAudioElement | null = null

function build(context: AudioContext) {
  const out = context.createGain()
  out.gain.value = 0
  out.connect(context.destination)

  // Warm low drone: two detuned oscillators through a gentle low-pass.
  const lp = context.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 620
  lp.Q.value = 0.6
  lp.connect(out)

  const freqs = [98, 110, 146.8] // G2-ish soft chord, low and consonant
  freqs.forEach((f, i) => {
    const o = context.createOscillator()
    o.type = 'sine'
    o.frequency.value = f
    o.detune.value = (i - 1) * 4
    const g = context.createGain()
    g.gain.value = i === 2 ? 0.05 : 0.09
    o.connect(g).connect(lp)
    o.start()
    nodes.push(o, g)
  })

  // A slow LFO on the filter — the room "breathing".
  const lfo = context.createOscillator()
  lfo.frequency.value = 0.06
  const lfoGain = context.createGain()
  lfoGain.gain.value = 180
  lfo.connect(lfoGain).connect(lp.frequency)
  lfo.start()
  nodes.push(lfo, lfoGain)

  // A breath of pink-ish air from filtered noise.
  const bufferSize = 2 * context.sampleRate
  const noiseBuf = context.createBuffer(1, bufferSize, context.sampleRate)
  const data = noiseBuf.getChannelData(0)
  let last = 0
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.sin(i * 0.0007) * 0.5 + (i % 97) / 97 - 0.5 // deterministic, no Math.random
    last = (last + 0.02 * white) / 1.02
    data[i] = last * 3.2
  }
  const noise = context.createBufferSource()
  noise.buffer = noiseBuf
  noise.loop = true
  const nf = context.createBiquadFilter()
  nf.type = 'bandpass'
  nf.frequency.value = 900
  nf.Q.value = 0.4
  const ng = context.createGain()
  ng.gain.value = 0.02
  noise.connect(nf).connect(ng).connect(out)
  noise.start()
  nodes.push(noise, nf, ng)

  nodes.push(out)
  return out
}

export function isAmbienceSupported(): boolean {
  return typeof window !== 'undefined' && 'AudioContext' in window
}

export async function playAmbience() {
  // Real-track path (when an asset is provided).
  if (AMBIENCE_TRACK) {
    if (!el) {
      el = new Audio(AMBIENCE_TRACK)
      el.loop = true
      el.volume = 0
    }
    await el.play().catch(() => {})
    fade(el, 0.5, 1600)
    return
  }

  if (!isAmbienceSupported()) return
  if (!ctx) {
    ctx = new AudioContext()
    master = build(ctx)
  }
  if (ctx.state === 'suspended') await ctx.resume()
  if (master) {
    const now = ctx.currentTime
    master.gain.cancelScheduledValues(now)
    master.gain.setValueAtTime(master.gain.value, now)
    master.gain.linearRampToValueAtTime(0.5, now + 2.2)
  }
}

export function stopAmbience() {
  if (el) {
    fade(el, 0, 900, () => el?.pause())
    return
  }
  if (ctx && master) {
    const now = ctx.currentTime
    master.gain.cancelScheduledValues(now)
    master.gain.setValueAtTime(master.gain.value, now)
    master.gain.linearRampToValueAtTime(0, now + 1.1)
  }
}

function fade(audio: HTMLAudioElement, to: number, ms: number, done?: () => void) {
  const from = audio.volume
  const start = performance.now()
  const step = (now: number) => {
    const t = Math.min((now - start) / ms, 1)
    audio.volume = from + (to - from) * t
    if (t < 1) requestAnimationFrame(step)
    else done?.()
  }
  requestAnimationFrame(step)
}
