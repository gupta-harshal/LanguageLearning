/**
 * Levelled Japanese storybook with sliding-window read-aloud.
 * Library → pick a story → one highlighted sentence at a time (prev/next peek).
 */
import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { api, apiBlob, ApiError } from "../api/client"
import { useAuth } from "../context/AuthContext"
import woodenImage from "../assets/wooden.png"
import scrollEnd from "../assets/scroll-end.svg"

type Sentence = { ja: string; reading: string; en: string }

type StoryCard = {
  id: string
  slug: string
  level: number
  order: number
  titleJa: string
  titleEn: string
  summary: string
  theme: string
  sentenceCount: number
  progress: { sentenceIndex: number; completed: boolean; bestScore: number }
}

type LevelBlock = {
  level: number
  label: string
  unlocked: boolean
  completedCount: number
  stories: StoryCard[]
}

type FullStory = {
  id: string
  slug: string
  level: number
  titleJa: string
  titleEn: string
  summary: string
  theme: string
  sentences: Sentence[]
  progress: { sentenceIndex: number; completed: boolean; bestScore: number }
}

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

export default function StorybookReader() {
  const { refreshStats } = useAuth()
  const [levels, setLevels] = useState<LevelBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [story, setStory] = useState<FullStory | null>(null)
  const [index, setIndex] = useState(0)
  const [listening, setListening] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [feedback, setFeedback] = useState("")
  const [busy, setBusy] = useState(false)
  const [finished, setFinished] = useState(false)
  const [xpFlash, setXpFlash] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recogRef = useRef<SpeechRec | null>(null)

  const loadLibrary = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api<{ levels: LevelBlock[] }>("/learn/stories")
      setLevels(data.levels)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load stories")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadLibrary()
  }, [loadLibrary])

  const openStory = async (id: string) => {
    setBusy(true)
    setError(null)
    setFinished(false)
    setScore(null)
    setFeedback("")
    try {
      const data = await api<{ locked: boolean; story: FullStory; message?: string }>(`/learn/stories/${id}`)
      if (data.locked) {
        setError(data.message || "This level is locked")
        return
      }
      setStory(data.story)
      setIndex(data.story.progress.completed ? 0 : data.story.progress.sentenceIndex)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not open story")
    } finally {
      setBusy(false)
    }
  }

  const current = story?.sentences[index]
  const prev = story && index > 0 ? story.sentences[index - 1] : null
  const next = story && index < story.sentences.length - 1 ? story.sentences[index + 1] : null

  const playTts = async () => {
    if (!current || busy) return
    setBusy(true)
    try {
      const blob = await apiBlob("/audio/TTS", { text: current.ja })
      const url = URL.createObjectURL(blob)
      if (audioRef.current) {
        audioRef.current.pause()
        URL.revokeObjectURL(audioRef.current.src)
      }
      const audio = new Audio(url)
      audioRef.current = audio
      await audio.play()
    } catch (err) {
      setFeedback(err instanceof ApiError ? err.message : "TTS unavailable")
    } finally {
      setBusy(false)
    }
  }

  const saveProgress = async (nextIndex: number, sc: number, complete = false) => {
    if (!story) return
    try {
      const res = await api<{ xpGained: number; justCompleted: boolean }>(`/learn/stories/${story.id}/progress`, {
        method: "POST",
        body: { sentenceIndex: nextIndex, score: sc, complete },
      })
      if (res.xpGained > 0) {
        setXpFlash(res.xpGained)
        setTimeout(() => setXpFlash(null), 1800)
        void refreshStats()
      }
      if (res.justCompleted) setFinished(true)
    } catch {
      /* offline / demo */
    }
  }

  const goNext = async (sc = score ?? 0) => {
    if (!story) return
    if (index >= story.sentences.length - 1) {
      await saveProgress(index, sc, true)
      setFinished(true)
      return
    }
    const ni = index + 1
    setIndex(ni)
    setScore(null)
    setFeedback("")
    await saveProgress(ni, sc, false)
  }

  const goPrev = () => {
    if (index <= 0) return
    setIndex((i) => i - 1)
    setScore(null)
    setFeedback("")
  }

  const startListening = () => {
    const Ctor = getSpeechRecognition()
    if (!Ctor || !current) {
      setFeedback("Speech recognition needs Chrome / Edge.")
      return
    }
    const rec = new Ctor()
    recogRef.current = rec
    rec.lang = "ja-JP"
    rec.continuous = false
    rec.interimResults = false
    setListening(true)
    setFeedback("聞いています… speak the highlighted line")
    rec.onresult = async (ev) => {
      const heard = ev.results[0]?.[0]?.transcript || ""
      setListening(false)
      try {
        const res = await api<{ score: number; pass: boolean }>("/learn/stories/score", {
          method: "POST",
          body: { expected: current.ja, heard },
        })
        setScore(res.score)
        if (res.pass) {
          setFeedback(`いい発音！ ${res.score}% — advancing…`)
          setTimeout(() => void goNext(res.score), 700)
        } else {
          setFeedback(`Heard 「${heard}」 — ${res.score}%. Try again or Skip.`)
        }
      } catch {
        setFeedback(`Heard 「${heard}」`)
      }
    }
    rec.onerror = () => {
      setListening(false)
      setFeedback("Mic error — try again or use Skip.")
    }
    rec.onend = () => setListening(false)
    rec.start()
  }

  const stopListening = () => {
    recogRef.current?.stop()
    setListening(false)
  }

  const backToLibrary = () => {
    setStory(null)
    setFinished(false)
    void loadLibrary()
  }

  // ─── Reader view ───────────────────────────────────────────────────────
  if (story) {
    const pct = Math.round(((index + (finished ? 1 : 0)) / story.sentences.length) * 100)
    return (
      <div
        className="min-h-[100svh] bg-cover bg-center flex flex-col items-center py-8 px-3 relative"
        style={{ backgroundImage: `url(${woodenImage})` }}
      >
        <button
          type="button"
          onClick={backToLibrary}
          className="fixed top-4 left-4 z-50 rounded-full bg-[#4a2e15]/90 px-4 py-2 text-sm font-bold text-[#fdf5e6] shadow-lg"
        >
          ← Library
        </button>

        {xpFlash != null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-4 right-4 z-50 rounded-full bg-amber-500 px-4 py-2 font-bold text-white shadow-lg"
          >
            +{xpFlash} XP
          </motion.div>
        )}

        <ScrollShell>
          <p className="text-center text-xs uppercase tracking-[0.25em] text-[#8b4513]/80 mb-1">
            Level {story.level} · {index + 1}/{story.sentences.length}
          </p>
          <h1 className="font-anglo-japanese text-3xl sm:text-4xl text-center text-[#4a2e15] mb-1">
            {story.titleJa}
          </h1>
          <p className="text-center text-sm text-[#6b4423]/80 mb-4">{story.titleEn}</p>

          <div className="mb-6 h-2 w-full rounded-full bg-[#8b4513]/15 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#c45c26] to-[#8b4513] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>

          {finished ? (
            <div className="text-center py-10">
              <p className="text-5xl mb-3">🌸</p>
              <h2 className="font-anglo-japanese text-3xl text-[#4a2e15] mb-2">読み終わりました！</h2>
              <p className="text-[#6b4423] mb-6">You finished this story. Keep climbing levels.</p>
              <button
                type="button"
                onClick={backToLibrary}
                className="rounded-full bg-gradient-to-r from-[#8b4513] to-[#a0522d] px-8 py-3 font-bold text-[#fdf5e6] shadow-lg"
              >
                Back to library
              </button>
            </div>
          ) : (
            <>
              {/* Sliding window */}
              <div className="relative min-h-[280px] flex flex-col items-center justify-center gap-3">
                <AnimatePresence mode="popLayout">
                  {prev && (
                    <motion.p
                      key={`p-${index}`}
                      initial={{ opacity: 0, y: -12 }}
                      animate={{ opacity: 0.35, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-center font-japanese text-lg text-[#4a2e15] line-clamp-2 px-4"
                    >
                      {prev.ja}
                    </motion.p>
                  )}

                  <motion.div
                    key={`c-${index}`}
                    initial={{ opacity: 0, scale: 0.94, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -16 }}
                    transition={{ type: "spring", stiffness: 280, damping: 24 }}
                    className="w-full rounded-2xl border-2 border-[#c45c26]/40 bg-[#fff8ee]/90 px-5 py-6 shadow-inner text-center"
                  >
                    <p className="mb-2 text-sm text-[#8b4513]/70 font-japanese">{current?.reading}</p>
                    <p className="font-japanese text-3xl sm:text-4xl leading-relaxed text-[#3a2511] mb-3">
                      {current?.ja}
                    </p>
                    <p className="text-sm text-[#6b4423]/75 italic">{current?.en}</p>
                  </motion.div>

                  {next && (
                    <motion.p
                      key={`n-${index}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 0.3, y: 0 }}
                      className="text-center font-japanese text-lg text-[#4a2e15] line-clamp-2 px-4"
                    >
                      {next.ja}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {feedback && (
                <p className="mt-4 text-center text-sm font-semibold text-[#4a2e15]">{feedback}</p>
              )}
              {score != null && (
                <p className="text-center text-xs text-[#8b4513]">Accuracy {score}%</p>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={index === 0}
                  className="rounded-full border border-[#8b4513]/40 px-4 py-2 text-sm font-bold text-[#4a2e15] disabled:opacity-30"
                >
                  ← Prev
                </button>
                <button
                  type="button"
                  onClick={() => void playTts()}
                  disabled={busy}
                  className="rounded-full bg-[#4a2e15] px-5 py-2.5 text-sm font-bold text-[#fdf5e6] shadow"
                >
                  🔊 Hear
                </button>
                <button
                  type="button"
                  onClick={listening ? stopListening : startListening}
                  className={`rounded-full px-5 py-2.5 text-sm font-bold text-white shadow ${
                    listening ? "bg-emerald-600 animate-pulse" : "bg-[#c45c26]"
                  }`}
                >
                  {listening ? "⏹ Stop" : "🎤 Read aloud"}
                </button>
                <button
                  type="button"
                  onClick={() => void goNext(score ?? 40)}
                  className="rounded-full border border-[#8b4513]/40 px-4 py-2 text-sm font-bold text-[#4a2e15]"
                >
                  Skip →
                </button>
              </div>
              <p className="mt-3 text-center text-[11px] text-[#6b4423]/70">
                Speak the highlighted line. Pass (~55%+) auto-advances the window.
              </p>
            </>
          )}
        </ScrollShell>
      </div>
    )
  }

  // ─── Library view ──────────────────────────────────────────────────────
  return (
    <div
      className="min-h-[100svh] bg-cover bg-center flex flex-col items-center py-8 px-3"
      style={{ backgroundImage: `url(${woodenImage})` }}
    >
      <Link
        to="/dashboard"
        className="fixed top-4 left-4 z-50 rounded-full bg-[#4a2e15]/90 px-4 py-2 text-sm font-bold text-[#fdf5e6] shadow-lg"
      >
        ← Dashboard
      </Link>

      <ScrollShell>
        <h1 className="font-anglo-japanese text-4xl sm:text-5xl text-center text-[#4a2e15] mb-2">
          物語ライブラリ
        </h1>
        <p className="text-center text-[#6b4423] mb-8 max-w-md mx-auto text-sm sm:text-base">
          Read Japanese aloud in a sliding window. Finish one story to unlock the next level.
        </p>

        {loading && <p className="text-center text-[#8b4513]">Loading stories…</p>}
        {error && <p className="text-center text-red-700 mb-4">{error}</p>}

        <div className="space-y-8">
          {levels.map((block) => (
            <section key={block.level}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="font-bold text-[#4a2e15] text-lg">
                  {block.unlocked ? "" : "🔒 "}
                  {block.label}
                </h2>
                <span className="text-xs text-[#8b4513]">
                  {block.completedCount}/{block.stories.length} done
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {block.stories.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    disabled={!block.unlocked || busy}
                    onClick={() => void openStory(s.id)}
                    className={`text-left rounded-2xl border p-4 transition-all ${
                      block.unlocked
                        ? "border-[#c45c26]/35 bg-[#fff8ee]/85 hover:-translate-y-0.5 hover:shadow-md"
                        : "border-[#8b4513]/15 bg-[#f5ead7]/50 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <p className="font-japanese text-xl text-[#3a2511] mb-0.5">{s.titleJa}</p>
                    <p className="text-xs font-semibold text-[#8b4513] mb-2">{s.titleEn}</p>
                    <p className="text-xs text-[#6b4423] line-clamp-2 mb-2">{s.summary}</p>
                    <div className="flex justify-between text-[10px] uppercase tracking-wide text-[#8b4513]/80">
                      <span>{s.sentenceCount} lines</span>
                      <span>
                        {s.progress.completed
                          ? "✓ Done"
                          : s.progress.sentenceIndex > 0
                            ? `Line ${s.progress.sentenceIndex + 1}`
                            : "Start"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </ScrollShell>
    </div>
  )
}

function ScrollShell({ children }: { children: React.ReactNode }) {
  const endHeight = 56
  return (
    <div className="relative z-10 w-[94vw] md:w-[80vw] max-w-3xl flex flex-col items-center">
      <div style={{ width: "100%", height: endHeight }} className="relative z-[3]">
        <img src={scrollEnd} alt="" className="w-full h-full object-cover drop-shadow-lg" />
      </div>
      <div
        className="w-full bg-[#fdf5e6] border-x-[10px] border-[#8b4513] shadow-2xl relative z-[2] px-4 sm:px-10 py-8 sm:py-10 overflow-y-auto max-h-[78vh]"
        style={{
          marginTop: -12,
          marginBottom: -12,
          backgroundImage: 'url("https://www.transparenttextures.com/patterns/rice-paper.png")',
        }}
      >
        {children}
      </div>
      <div style={{ width: "100%", height: endHeight }} className="relative z-[3]">
        <img src={scrollEnd} alt="" className="w-full h-full object-cover drop-shadow-lg" />
      </div>
    </div>
  )
}
