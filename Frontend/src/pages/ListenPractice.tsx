import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { api, apiBlob, ApiError } from "../api/client"

type ListenItem = {
  id: string
  prompt: string
  reading: string
  english: string
  hint: string
  ttsText: string
}

export default function ListenPractice() {
  const [item, setItem] = useState<ListenItem | null>(null)
  const [answer, setAnswer] = useState("")
  const [result, setResult] = useState<{ correct: boolean; blank: string; full: string; english: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const load = async () => {
    setResult(null)
    setAnswer("")
    setError(null)
    try {
      const data = await api<ListenItem>("/learn/listen/next")
      setItem(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load")
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const play = async () => {
    if (!item) return
    try {
      const blob = await apiBlob("/audio/TTS", { text: item.ttsText })
      const url = URL.createObjectURL(blob)
      if (audioRef.current) {
        audioRef.current.pause()
        URL.revokeObjectURL(audioRef.current.src)
      }
      const audio = new Audio(url)
      audioRef.current = audio
      await audio.play()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "TTS failed — you can still answer from the reading")
    }
  }

  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item || busy) return
    setBusy(true)
    setError(null)
    try {
      const data = await api<{ correct: boolean; blank: string; full: string; english: string }>(
        "/learn/listen/check",
        { method: "POST", body: { id: item.id, answer } }
      )
      setResult(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Check failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-[100svh] bg-[#0c1422] text-white px-4 py-8">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/dashboard" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">←</Link>
          <h1 className="font-anglo-japanese text-2xl">Listening Cloze</h1>
          <div className="w-10" />
        </div>

        <p className="text-sm text-white/55 mb-5">
          Hear Japanese, fill the missing word. Builds listening + spelling together.
        </p>

        {error && <p className="mb-3 text-sm text-red-300">{error}</p>}

        {item && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
            <p className="font-japanese text-3xl text-center leading-relaxed">{item.prompt}</p>
            <p className="text-center text-xs text-white/45">{item.reading}</p>
            <p className="text-center text-sm text-indigo-200/70">{item.english}</p>
            <p className="text-center text-[11px] text-white/40">Hint: {item.hint}</p>

            <button
              type="button"
              onClick={() => void play()}
              className="w-full rounded-xl bg-indigo-500/80 py-3 font-semibold"
            >
              🔊 Play sentence
            </button>

            <form onSubmit={check} className="flex gap-2">
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Missing word…"
                className="flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-3 font-japanese outline-none focus:border-pink-400/50"
              />
              <button
                type="submit"
                disabled={busy}
                className="rounded-xl bg-pink-500 px-4 font-semibold disabled:opacity-50"
              >
                Check
              </button>
            </form>

            {result && (
              <div
                className={`rounded-xl px-4 py-3 text-sm ${
                  result.correct ? "bg-emerald-500/15 border border-emerald-400/40" : "bg-red-500/15 border border-red-400/40"
                }`}
              >
                <p className="font-semibold">{result.correct ? "正解！" : "Almost — keep going"}</p>
                <p className="font-japanese mt-1">{result.full}</p>
                <p className="text-white/60 mt-1">Answer: {result.blank}</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => void load()}
              className="w-full rounded-xl border border-white/15 py-2.5 text-sm hover:bg-white/10"
            >
              Next sentence
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
