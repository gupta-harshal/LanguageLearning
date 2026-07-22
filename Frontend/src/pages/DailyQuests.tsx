import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { api, ApiError } from "../api/client"
import { useAuth } from "../context/AuthContext"

type Quest = { id: string; title: string; blurb: string; xp: number }
type Daily = {
  day: string
  xpToday: number
  goalXp: number
  quests: Record<string, boolean>
}

const LINKS: Record<string, string> = {
  srs: "/srs",
  talk: "/talk",
  chat: "/chat",
  game: "/game1",
  listen: "/listen",
  journal: "/journal",
  story: "/story",
}

export default function DailyQuests() {
  const { stats, refreshStats } = useAuth()
  const [daily, setDaily] = useState<Daily | null>(null)
  const [catalog, setCatalog] = useState<Quest[]>([])
  const [badges, setBadges] = useState<Array<{ id: string; label: string }>>([])
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      const data = await api<{
        daily: Daily
        catalog: Quest[]
        badges: Array<{ id: string; label: string }>
        progress: number
      }>("/learn/daily")
      setDaily(data.daily)
      setCatalog(data.catalog)
      setBadges(data.badges)
      setProgress(data.progress)
      await refreshStats()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load quests")
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="min-h-[100svh] bg-[#100c1a] text-white px-4 py-8">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/dashboard" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">←</Link>
          <h1 className="font-anglo-japanese text-2xl">Daily Quests</h1>
          <div className="w-10" />
        </div>

        <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex justify-between text-sm mb-2">
            <span>Today’s XP goal</span>
            <span>
              {daily?.xpToday ?? 0}/{daily?.goalXp ?? 80}
            </span>
          </div>
          <div className="h-3 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-pink-500 to-amber-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-white/50">
            🔥 {stats?.streak ?? 0} day streak · Lv {stats?.level ?? 1} · {stats?.xp ?? 0} XP
          </p>
        </div>

        {error && <p className="mb-4 text-sm text-red-300">{error}</p>}

        <div className="space-y-3 mb-8">
          {catalog.map((q) => {
            const done = !!daily?.quests?.[q.id]
            return (
              <Link
                key={q.id}
                to={LINKS[q.id] || "/dashboard"}
                className={`block rounded-2xl border px-4 py-4 transition-all ${
                  done
                    ? "border-emerald-400/40 bg-emerald-500/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {done ? "✓ " : ""}
                      {q.title}
                    </p>
                    <p className="text-xs text-white/55 mt-1">{q.blurb}</p>
                  </div>
                  <span className="text-xs font-bold text-amber-300">+{q.xp} XP</span>
                </div>
              </Link>
            )
          })}
        </div>

        <h2 className="font-anglo-japanese text-xl mb-3">Badges</h2>
        <div className="flex flex-wrap gap-2">
          {badges.length === 0 && (
            <p className="text-sm text-white/50">Keep practicing to unlock badges.</p>
          )}
          {badges.map((b) => (
            <span
              key={b.id}
              className="rounded-full border border-pink-400/40 bg-pink-500/15 px-3 py-1 text-xs"
            >
              🏅 {b.label}
            </span>
          ))}
        </div>
      </div>
    </main>
  )
}
