import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { api, ApiError } from "../api/client"

type Entry = {
  id: string
  word: string
  reading: string
  meaning: string
  source: string
  createdAt: string
}

export default function VocabJournal() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [word, setWord] = useState("")
  const [reading, setReading] = useState("")
  const [meaning, setMeaning] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    try {
      const data = await api<{ entries: Entry[] }>("/learn/journal")
      setEntries(data.entries || [])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load journal")
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await api("/learn/journal", {
        method: "POST",
        body: { word, reading, meaning, source: "manual" },
      })
      setWord("")
      setReading("")
      setMeaning("")
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save")
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-[100svh] bg-[#0e121c] text-white px-4 py-8">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/dashboard" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">←</Link>
          <h1 className="font-anglo-japanese text-2xl">Vocab Journal</h1>
          <div className="w-10" />
        </div>

        <p className="text-sm text-white/55 mb-4">
          Save words from lessons, calls, and reading. Review them anytime — feeds your daily quest.
        </p>

        <form onSubmit={add} className="mb-6 space-y-2 rounded-3xl border border-white/10 bg-white/5 p-4">
          <input
            value={word}
            onChange={(e) => setWord(e.target.value)}
            required
            placeholder="日本語の単語"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 font-japanese outline-none focus:border-pink-400/50"
          />
          <input
            value={reading}
            onChange={(e) => setReading(e.target.value)}
            placeholder="Reading / furigana"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 outline-none focus:border-pink-400/50"
          />
          <input
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            placeholder="English meaning"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 outline-none focus:border-pink-400/50"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-indigo-500 py-2.5 font-semibold disabled:opacity-50"
          >
            Save word
          </button>
        </form>

        {error && <p className="mb-3 text-sm text-red-300">{error}</p>}

        <ul className="space-y-2">
          {entries.map((en) => (
            <li key={en.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="font-japanese text-xl">{en.word}</p>
              {en.reading && <p className="text-xs text-white/50">{en.reading}</p>}
              {en.meaning && <p className="text-sm text-indigo-200/80 mt-1">{en.meaning}</p>}
              <p className="text-[10px] uppercase tracking-wider text-white/35 mt-2">
                {en.source} · {new Date(en.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
          {entries.length === 0 && (
            <p className="text-center text-sm text-white/45 py-8">No words yet — save your first one!</p>
          )}
        </ul>
      </div>
    </main>
  )
}
