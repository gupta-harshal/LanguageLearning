import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import TalkAvatar from "../components/Talk/TalkAvatar"
import { api, apiBlob, ApiError } from "../api/client"
import { useAuth } from "../context/AuthContext"

type Level = "beginner" | "elementary" | "intermediate" | "advanced"
type Scenario = "greetings" | "cafe" | "shopping" | "travel" | "daily"
type Mood = "idle" | "listening" | "talking" | "happy"

type ChatReply = {
  replyJapanese: string
  replyReading: string
  replyEnglish: string
  tip: string
  correction: string | null
}

type Bubble = {
  id: string
  role: "user" | "mike"
  japanese?: string
  english?: string
  reading?: string
}

const LEVELS: { id: Level; label: string; blurb: string }[] = [
  { id: "beginner", label: "Beginner", blurb: "N5 · hiragana-first" },
  { id: "elementary", label: "Elementary", blurb: "N4–N5 · short sentences" },
  { id: "intermediate", label: "Intermediate", blurb: "N3–N4 · natural chat" },
  { id: "advanced", label: "Advanced", blurb: "N2–N3 · fluent talk" },
]

const SCENARIOS: { id: Scenario; label: string; emoji: string }[] = [
  { id: "greetings", label: "Greetings", emoji: "👋" },
  { id: "cafe", label: "Café", emoji: "☕" },
  { id: "shopping", label: "Shopping", emoji: "🛒" },
  { id: "travel", label: "Travel", emoji: "🚅" },
  { id: "daily", label: "Daily chat", emoji: "💬" },
]

type SpeechRec = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((ev: { results: { [i: number]: { [j: number]: { transcript: string }; isFinal: boolean } } }) => void) | null
  onerror: ((ev: { error: string }) => void) | null
  onend: (() => void) | null
}

function getSpeechRecognition(): (new () => SpeechRec) | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRec
    webkitSpeechRecognition?: new () => SpeechRec
  }
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

/** Rough Japanese similarity for shadowing feedback (0–100). */
function shadowAccuracy(expected: string, heard: string): number {
  const a = expected.replace(/\s+/g, "")
  const b = heard.replace(/\s+/g, "")
  if (!a || !b) return 0
  if (a === b) return 100
  let hits = 0
  const len = Math.max(a.length, b.length)
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] === b[i]) hits++
  }
  // also reward substring containment
  if (a.includes(b) || b.includes(a)) hits = Math.max(hits, Math.floor(len * 0.7))
  return Math.round((hits / len) * 100)
}

export default function TalkPractice() {
  const { refreshStats } = useAuth()
  const [level, setLevel] = useState<Level>("beginner")
  const [scenario, setScenario] = useState<Scenario>("daily")
  const [keigo, setKeigo] = useState(false)
  const [shadow, setShadow] = useState(false)
  const [started, setStarted] = useState(false)
  const [mood, setMood] = useState<Mood>("idle")
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [tip, setTip] = useState("Hold the mic and speak Japanese — ミケ will reply.")
  const [correction, setCorrection] = useState<string | null>(null)
  const [shadowScore, setShadowScore] = useState<number | null>(null)
  const [lastMikeLine, setLastMikeLine] = useState("")
  const [listening, setListening] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [textInput, setTextInput] = useState("")
  const [speechSupported, setSpeechSupported] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recogRef = useRef<SpeechRec | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSpeechSupported(!!getSpeechRecognition())
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [bubbles])

  const playVoice = async (text: string) => {
    setMood("talking")
    try {
      const blob = await apiBlob("/audio/TTS", { text })
      const url = URL.createObjectURL(blob)
      if (audioRef.current) {
        audioRef.current.pause()
        URL.revokeObjectURL(audioRef.current.src)
      }
      const audio = new Audio(url)
      audioRef.current = audio
      await audio.play()
      await new Promise<void>((resolve) => {
        audio.onended = () => resolve()
        audio.onerror = () => resolve()
      })
      setMood("happy")
      setTimeout(() => setMood("idle"), 800)
    } catch (err) {
      setMood("idle")
      if (err instanceof ApiError && err.status === 429) {
        setError(err.message)
      }
      // Still show text even if TTS fails / capped
    }
  }

  const sendTurn = async (userText: string, reset = false) => {
    const trimmed = userText.trim()
    if (!trimmed || busy) return
    setBusy(true)
    setError(null)
    setCorrection(null)
    setShadowScore(null)

    if (!reset && shadow && lastMikeLine) {
      const score = shadowAccuracy(lastMikeLine, trimmed)
      setShadowScore(score)
      void api("/learn/shadow", { method: "POST", body: { score } }).then(() => refreshStats())
      setTip(`Shadow score: ${score}% — ${score >= 80 ? "素晴らしい！" : "もう一度挑戦！"}`)
    }

    if (!reset) {
      setBubbles((b) => [
        ...b,
        { id: `u-${Date.now()}`, role: "user", japanese: trimmed },
      ])
    }

    try {
      const data = await api<ChatReply & { vocabId?: string | null }>("/chat/character", {
        method: "POST",
        body: { message: trimmed, level, scenario, reset, keigo, shadow },
      })

      setBubbles((b) => [
        ...b,
        {
          id: `m-${Date.now()}`,
          role: "mike",
          japanese: data.replyJapanese,
          english: data.replyEnglish,
          reading: data.replyReading,
        },
      ])
      setLastMikeLine(data.replyJapanese)
      if (!shadow || reset) setTip(data.tip || tip)
      setCorrection(data.correction)
      await playVoice(data.replyJapanese)

      // One-tap save to journal when correction/vocab appears
      if (data.correction || data.replyJapanese) {
        /* optional — user can use journal page */
      }
      await refreshStats()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Could not reach the conversation server.")
      }
      setMood("idle")
    } finally {
      setBusy(false)
    }
  }

  const startCall = async () => {
    setStarted(true)
    setBubbles([])
    setCorrection(null)
    setTip("ミケ is joining the call…")
    await sendTurn(
      "Please greet me warmly and start our Japanese conversation for this scenario. Keep it short.",
      true
    )
  }

  const stopListening = () => {
    try {
      recogRef.current?.stop()
    } catch {
      /* ignore */
    }
    setListening(false)
    if (mood === "listening") setMood("idle")
  }

  const startListening = () => {
    if (busy || listening) return
    const Ctor = getSpeechRecognition()
    if (!Ctor) {
      setError("Speech recognition isn’t supported in this browser. Use Chrome, or type below.")
      return
    }
    setError(null)
    const recog = new Ctor()
    recog.lang = "ja-JP"
    recog.continuous = false
    recog.interimResults = false
    recogRef.current = recog

    recog.onresult = (ev) => {
      const transcript = ev.results[0]?.[0]?.transcript || ""
      if (transcript) void sendTurn(transcript)
    }
    recog.onerror = (ev) => {
      setListening(false)
      setMood("idle")
      if (ev.error !== "aborted") {
        setError(`Mic error: ${ev.error}. You can type instead.`)
      }
    }
    recog.onend = () => {
      setListening(false)
      if (mood === "listening") setMood("idle")
    }

    setListening(true)
    setMood("listening")
    try {
      recog.start()
    } catch {
      setError("Could not start the microphone.")
      setListening(false)
      setMood("idle")
    }
  }

  const resetCall = async () => {
    stopListening()
    try {
      await api("/chat/character", { method: "DELETE" })
    } catch {
      /* ignore */
    }
    setStarted(false)
    setBubbles([])
    setMood("idle")
    setCorrection(null)
    setTip("Hold the mic and speak Japanese — ミケ will reply.")
  }

  return (
    <main className="relative min-h-[100svh] w-full overflow-hidden bg-[#0c0814] text-white">
      <div className="pointer-events-none absolute -top-24 left-1/4 h-80 w-80 rounded-full bg-pink-600/25 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]" />

      {/* Top bar */}
      <header className="relative z-20 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-white/10 bg-black/30 backdrop-blur-md">
        <Link
          to="/dashboard"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20"
          aria-label="Back"
        >
          ←
        </Link>
        <div className="text-center min-w-0">
          <p className="font-anglo-japanese text-lg sm:text-xl truncate">Talk with ミケ</p>
          <p className="text-[10px] sm:text-xs text-white/50 uppercase tracking-[0.18em]">
            Japanese video practice
          </p>
        </div>
        <button
          type="button"
          onClick={() => void resetCall()}
          className="rounded-xl bg-white/10 px-3 py-2 text-xs sm:text-sm hover:bg-white/20"
        >
          End
        </button>
      </header>

      {!started ? (
        <section className="relative z-10 mx-auto max-w-2xl px-4 py-8 sm:py-12">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-xl">
            <h1 className="font-anglo-japanese text-3xl sm:text-4xl mb-2">Join a call with ミケ</h1>
            <p className="text-white/60 text-sm mb-6">
              Practice real Japanese conversation. Pick your level and a scene — then speak (or type).
              ミケ replies in Japanese with voice, reading, English, and coaching tips.
            </p>

            <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Your level</p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLevel(l.id)}
                  className={`rounded-2xl border px-3 py-3 text-left transition-all ${
                    level === l.id
                      ? "border-pink-400/60 bg-pink-500/20"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <span className="block font-semibold">{l.label}</span>
                  <span className="text-xs text-white/50">{l.blurb}</span>
                </button>
              ))}
            </div>

            <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Scene</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setScenario(s.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-all ${
                    scenario === s.id
                      ? "border-indigo-300/50 bg-indigo-500/30"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>

            <div className="mb-8 flex flex-col gap-2 text-sm">
              <label className="flex items-center gap-2 text-white/70">
                <input type="checkbox" checked={keigo} onChange={(e) => setKeigo(e.target.checked)} />
                Keigo / polite です・ます mode
              </label>
              <label className="flex items-center gap-2 text-white/70">
                <input type="checkbox" checked={shadow} onChange={(e) => setShadow(e.target.checked)} />
                Shadowing mode (repeat after ミケ)
              </label>
            </div>

            <button
              type="button"
              onClick={() => void startCall()}
              disabled={busy}
              className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-indigo-500 py-4 font-anglo-japanese text-xl shadow-[0_0_30px_rgba(236,72,153,0.35)] hover:scale-[1.02] transition-transform disabled:opacity-60"
            >
              {busy ? "Connecting…" : "Start call"}
            </button>
            {!speechSupported && (
              <p className="mt-3 text-center text-xs text-amber-200/80">
                This browser has no speech recognition — you can still type messages after joining.
              </p>
            )}
          </div>
        </section>
      ) : (
        <div className="relative z-10 flex h-[calc(100svh-3.75rem)] flex-col lg:flex-row">
          {/* Character stage */}
          <div className="relative flex-1 min-h-[40vh] lg:min-h-0 border-b lg:border-b-0 lg:border-r border-white/10">
            <TalkAvatar mood={mood} />
            <div className="absolute top-3 left-3 rounded-full bg-red-500/90 px-3 py-1 text-xs font-bold tracking-wide flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              LIVE · ミケ
            </div>
            <AnimatePresence>
              {(mood === "talking" || mood === "listening") && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-4 left-0 right-0 text-center text-sm font-japanese text-white/80"
                >
                  {mood === "listening" ? "聞いています…" : "話しています…"}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Chat / controls */}
          <div className="flex w-full lg:w-[420px] flex-col bg-black/40 backdrop-blur-md">
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {bubbles.map((b) => (
                <div
                  key={b.id}
                  className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm ${
                    b.role === "user"
                      ? "ml-auto bg-pink-500/25 border border-pink-400/30"
                      : "mr-auto bg-white/10 border border-white/10"
                  }`}
                >
                  {b.role === "mike" && (
                    <p className="text-[10px] uppercase tracking-wider text-pink-300 mb-1">ミケ</p>
                  )}
                  <p className="font-japanese text-base leading-relaxed">{b.japanese}</p>
                  {b.reading && <p className="mt-1 text-xs text-white/50">{b.reading}</p>}
                  {b.english && <p className="mt-1 text-xs text-indigo-200/80">{b.english}</p>}
                </div>
              ))}
            </div>

            {(tip || correction || shadowScore !== null) && (
              <div className="mx-4 mb-2 rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/90">
                {shadowScore !== null && (
                  <p className="mb-1 font-bold text-emerald-200">Echo score: {shadowScore}%</p>
                )}
                {correction && <p className="mb-1"><span className="font-bold">Try:</span> {correction}</p>}
                {tip && <p><span className="font-bold">Tip:</span> {tip}</p>}
                {lastMikeLine && (
                  <button
                    type="button"
                    className="mt-2 text-[11px] underline text-pink-200"
                    onClick={() => {
                      void api("/learn/journal", {
                        method: "POST",
                        body: {
                          word: lastMikeLine.slice(0, 40),
                          meaning: "From talk with ミケ",
                          source: "talk",
                        },
                      })
                    }}
                  >
                    Save ミケ’s line to journal
                  </button>
                )}
              </div>
            )}

            {error && (
              <p className="mx-4 mb-2 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                {error}
              </p>
            )}

            <div className="border-t border-white/10 p-4 space-y-3">
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  disabled={busy}
                  onMouseDown={startListening}
                  onMouseUp={stopListening}
                  onMouseLeave={() => listening && stopListening()}
                  onTouchStart={(e) => {
                    e.preventDefault()
                    startListening()
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault()
                    stopListening()
                  }}
                  className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl shadow-lg transition-transform ${
                    listening
                      ? "bg-emerald-500 scale-110"
                      : "bg-gradient-to-br from-pink-500 to-rose-600 hover:scale-105"
                  } disabled:opacity-50`}
                  aria-label="Hold to speak"
                >
                  🎤
                </button>
              </div>
              <p className="text-center text-[11px] text-white/45">
                {speechSupported ? "Hold mic to speak Japanese" : "Type your reply below"}
              </p>

              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  const t = textInput
                  setTextInput("")
                  void sendTurn(t)
                }}
              >
                <input
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Or type in Japanese / English…"
                  disabled={busy}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-pink-400/50"
                />
                <button
                  type="submit"
                  disabled={busy || !textInput.trim()}
                  className="rounded-xl bg-indigo-500 px-4 text-sm font-semibold disabled:opacity-40"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
