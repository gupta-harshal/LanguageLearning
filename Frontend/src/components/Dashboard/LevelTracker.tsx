import { useEffect, useState } from "react"
import { api } from "../../api/client"
import { useTheme } from "../../ThemeContext"

type Skill = {
  skill: string
  label: string
  icon: string
  xp: number
  level: number
  progress: number
}

type ProgressReport = {
  overall: {
    xp: number
    level: number
    progress: number
    streak: number
    longestStreak: number
    practiceDays: number
    shadowBest: number
    badges: string[]
  }
  skills: Skill[]
}

const BAR_COLORS: Record<string, string> = {
  vocabulary: "from-pink-500 to-rose-400",
  speaking: "from-amber-500 to-orange-400",
  listening: "from-sky-500 to-cyan-400",
  writing: "from-violet-500 to-purple-400",
  reading: "from-emerald-500 to-green-400",
}

export default function LevelTracker() {
  const { isDarkMode } = useTheme()
  const [report, setReport] = useState<ProgressReport | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    api<ProgressReport>("/srs/progress")
      .then(setReport)
      .catch(() => setError(true))
  }, [])

  if (error) return null

  return (
    <div
      className={`${
        isDarkMode ? "glass-dark" : "glass"
      } rounded-3xl p-5 sm:p-6 glow-border relative overflow-hidden`}
    >
      <div className="absolute top-0 left-0 w-40 h-40 bg-indigo-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20 pointer-events-none" />

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-anglo-japanese text-2xl text-primary-font-color">Level Tracker</h2>
        <div className="rounded-full bg-pink-primary/20 px-3 py-1 text-sm font-bold text-pink-primary">
          Lv {report?.overall.level ?? 1}
        </div>
      </div>

      {/* Overall bar */}
      <div className="mb-5">
        <div className="mb-1 flex justify-between text-xs text-secondary-font-color">
          <span>Overall · {report?.overall.xp ?? 0} XP</span>
          <span>{report?.overall.progress ?? 0}% to Lv {(report?.overall.level ?? 1) + 1}</span>
        </div>
        <div className="h-3 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-indigo-500 transition-all duration-700"
            style={{ width: `${report?.overall.progress ?? 0}%` }}
          />
        </div>
      </div>

      {/* Per-skill bars */}
      <div className="space-y-3">
        {(report?.skills ?? []).map((s) => (
          <div key={s.skill}>
            <div className="mb-1 flex items-center justify-between text-xs text-secondary-font-color">
              <span>
                {s.icon} {s.label}{" "}
                <span className="font-bold text-primary-font-color">Lv {s.level}</span>
              </span>
              <span>{s.xp} XP</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${BAR_COLORS[s.skill] || "from-gray-400 to-gray-300"} transition-all duration-700`}
                style={{ width: `${s.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[11px] text-secondary-font-color">
        Every mode feeds a skill: SRS &amp; games → Vocabulary, calls → Speaking, cloze → Listening,
        chat → Writing, stories → Reading.
      </p>
    </div>
  )
}
