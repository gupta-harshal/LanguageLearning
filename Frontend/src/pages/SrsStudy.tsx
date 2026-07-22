import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { api, ApiError } from "../api/client"
import { useAuth } from "../context/AuthContext"

type SrsCard = {
  id: string | number
  word: string
  meaning: string
  furigana?: string
  romaji?: string
  level?: number
}

type Overview = {
  ready: boolean
  schedulerOnline: boolean
  experience: number
  maxTimeMin: number
  cardCount: number
}

export default function SrsStudy() {
  const { stats, refreshStats } = useAuth()
  const [overview, setOverview] = useState<Overview | null>(null)
  const [cards, setCards] = useState<SrsCard[]>([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("Your spaced-repetition deck — the spine of 日本語 Lab")
  const [error, setError] = useState<string | null>(null)
  const [sessionXp, setSessionXp] = useState(0)

  const card = cards[index]

  const load = async () => {
    setBusy(true)
    setError(null)
    try {
      await api("/srs/bootstrap", { method: "POST", body: { experience: 0, maxTimeMin: 15 } })
      const ov = await api<Overview>("/srs/overview")
      setOverview(ov)
      const data = await api<{ cards: SrsCard[] }>("/srs/cards")
      setCards(data.cards || [])
      setIndex(0)
      setFlipped(false)
      setMessage(
        ov.schedulerOnline
          ? `${data.cards?.length || 0} cards ready · ${ov.cardCount} in your memory bank`
          : "Scheduler offline — start the Python FSRS service and set SCHEDULER_URL"
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load SRS")
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const rate = async (submission: boolean, hard = false) => {
    if (!card || busy) return
    setBusy(true)
    setError(null)
    try {
      const result = await api<{ xpGained: number }>("/srs/review", {
        method: "POST",
        body: {
          source: "srs",
          results: [
            {
              id: String(card.id),
              submission,
              clicks: hard ? 5 : submission ? 1 : 6,
              time: hard ? 22 : submission ? 8 : 35,
            },
          ],
        },
      })
      setSessionXp((x) => x + (result.xpGained || 0))
      await refreshStats()
      const next = index + 1
      if (next >= cards.length) {
        setMessage(`Session complete · +${sessionXp + (result.xpGained || 0)} XP`)
        setCards([])
      } else {
        setIndex(next)
        setFlipped(false)
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Review failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-[100svh] bg-[#0f0b18] text-white px-4 py-6">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/dashboard" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            ←
          </Link>
          <h1 className="font-anglo-japanese text-2xl">SRS Deck</h1>
          <div className="text-right text-xs text-white/60">
            <div>🔥 {stats?.streak ?? 0}d</div>
            <div>{stats?.xp ?? 0} XP</div>
          </div>
        </div>

        <p className="mb-4 text-sm text-white/60">{message}</p>
        {overview && (
          <div className="mb-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl bg-white/5 border border-white/10 p-2">
              <p className="text-lg font-bold">{overview.cardCount}</p>
              <p className="text-white/50">known</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-2">
              <p className="text-lg font-bold">{stats?.practiceDays ?? 0}</p>
              <p className="text-white/50">practice days</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-2">
              <p className="text-lg font-bold">{stats?.longestStreak ?? stats?.streak ?? 0}</p>
              <p className="text-white/50">best streak</p>
            </div>
          </div>
        )}

        {error && (
          <p className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}

        {!card ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="mb-4 text-white/70">No cards in this session.</p>
            <button
              type="button"
              onClick={() => void load()}
              disabled={busy}
              className="rounded-xl bg-gradient-to-r from-pink-500 to-indigo-500 px-6 py-3 font-semibold"
            >
              {busy ? "Loading…" : "Draw cards"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className="w-full min-h-[220px] rounded-3xl border border-white/15 bg-gradient-to-b from-white/10 to-white/5 p-8 text-center"
            >
              {!flipped ? (
                <>
                  <p className="font-japanese text-5xl mb-2">{card.word}</p>
                  <p className="text-white/50 text-sm">{card.furigana || card.romaji || "tap to reveal"}</p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-semibold mb-2">{card.meaning}</p>
                  <p className="font-japanese text-xl text-pink-200">{card.word}</p>
                  <p className="text-sm text-white/50 mt-1">{card.romaji}</p>
                </>
              )}
            </button>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void rate(false)}
                className="rounded-xl bg-red-500/20 border border-red-400/40 py-3 text-sm font-semibold"
              >
                Again
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void rate(true, true)}
                className="rounded-xl bg-amber-500/20 border border-amber-400/40 py-3 text-sm font-semibold"
              >
                Hard
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void rate(true)}
                className="rounded-xl bg-emerald-500/20 border border-emerald-400/40 py-3 text-sm font-semibold"
              >
                Good
              </button>
            </div>
            <p className="text-center text-xs text-white/40">
              Card {index + 1}/{cards.length} · session +{sessionXp} XP
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
