// Lightweight synthesized sound effects using the Web Audio API.
// No audio assets required. All calls are guarded so they never crash the game.

let ctx: AudioContext | null = null
let muted = false

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null
  try {
    if (!ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ctx = new Ctor()
    }
    if (ctx.state === "suspended") void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

export function setMuted(value: boolean) {
  muted = value
}

export function isMuted() {
  return muted
}

/** Bright ascending chime for a correct answer. */
export function playChime() {
  if (muted) return
  const audio = getCtx()
  if (!audio) return
  try {
    const now = audio.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = audio.createOscillator()
      const gain = audio.createGain()
      osc.type = "triangle"
      osc.frequency.value = freq
      const t = now + i * 0.08
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.18, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5)
      osc.connect(gain).connect(audio.destination)
      osc.start(t)
      osc.stop(t + 0.55)
    })
  } catch {
    /* ignore */
  }
}

/** Deep rumbling thunder for a wrong answer, built from filtered noise. */
export function playThunder() {
  if (muted) return
  const audio = getCtx()
  if (!audio) return
  try {
    const now = audio.currentTime
    const duration = 1.4
    const bufferSize = audio.sampleRate * duration
    const buffer = audio.createBuffer(1, bufferSize, audio.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      // brown-ish noise that decays over time
      const decay = Math.pow(1 - i / bufferSize, 2)
      data[i] = (Math.random() * 2 - 1) * decay
    }
    const noise = audio.createBufferSource()
    noise.buffer = buffer

    const lowpass = audio.createBiquadFilter()
    lowpass.type = "lowpass"
    lowpass.frequency.setValueAtTime(400, now)
    lowpass.frequency.exponentialRampToValueAtTime(80, now + duration)

    const gain = audio.createGain()
    gain.gain.setValueAtTime(0.9, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    noise.connect(lowpass).connect(gain).connect(audio.destination)
    noise.start(now)
    noise.stop(now + duration)

    // sharp initial crack
    const crack = audio.createOscillator()
    const crackGain = audio.createGain()
    crack.type = "sawtooth"
    crack.frequency.setValueAtTime(140, now)
    crack.frequency.exponentialRampToValueAtTime(40, now + 0.25)
    crackGain.gain.setValueAtTime(0.4, now)
    crackGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3)
    crack.connect(crackGain).connect(audio.destination)
    crack.start(now)
    crack.stop(now + 0.3)
  } catch {
    /* ignore */
  }
}
