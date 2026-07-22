import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import type { SessionInfo } from "../context/AuthContext"
import { api } from "../api/client"

export default function Account() {
  const { user, stats, logout, logoutOthers, fetchSessions } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [maxDevices, setMaxDevices] = useState(3)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await api<{ sessions: SessionInfo[]; maxDevices: number; active: number }>(
        "/users/sessions"
      )
      setSessions(data.sessions || [])
      setMaxDevices(data.maxDevices || 3)
    } catch {
      try {
        setSessions(await fetchSessions())
      } catch {
        setNote("Could not load sessions.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate("/login", { replace: true })
  }

  const handleLogoutOthers = async () => {
    setBusy(true)
    setNote(null)
    try {
      await logoutOthers()
      setNote("Signed out of all other devices. Only this one remains.")
      await load()
    } catch {
      setNote("Could not sign out other devices.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-[100svh] bg-[#12101c] text-white px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/dashboard" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg hover:bg-white/20">
            ←
          </Link>
          <h1 className="font-anglo-japanese text-2xl sm:text-3xl">Account</h1>
          <div className="w-10" />
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-indigo-500 text-2xl font-bold">
              {user?.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="text-xl font-semibold">{user?.name}</p>
              <p className="text-white/60 text-sm">{user?.email}</p>
              <p className="text-xs text-white/45 mt-1">
                Lv {stats?.level ?? 1} · {stats?.xp ?? 0} XP · 🔥 {stats?.streak ?? 0}d
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="font-anglo-japanese text-xl">Active devices</h2>
            <button
              type="button"
              onClick={handleLogoutOthers}
              disabled={busy || sessions.length <= 1}
              className="rounded-lg bg-amber-500/20 border border-amber-400/40 px-3 py-1.5 text-sm text-amber-200 hover:bg-amber-500/30 disabled:opacity-40"
            >
              Sign out others
            </button>
          </div>
          <p className="mb-4 text-xs text-white/50">
            Max <span className="text-pink-300 font-semibold">{maxDevices}</span> devices at once.
            You are using <span className="text-white font-semibold">{sessions.length}/{maxDevices}</span>.
            Signing in on a 4th device signs out the oldest one.
          </p>

          {note && <p className="mb-3 text-sm text-white/70">{note}</p>}

          {loading ? (
            <p className="text-white/50">Loading…</p>
          ) : sessions.length === 0 ? (
            <p className="text-white/50">No active sessions found.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {sessions.map((s, i) => (
                <li
                  key={s.jti || i}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                    s.current ? "border-pink-400/50 bg-pink-500/10" : "border-white/10 bg-white/5"
                  }`}
                >
                  <span className="text-xl">💻</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {s.label || "Device"}
                      {s.current ? " · this device" : ""}
                    </p>
                    <p className="truncate text-xs text-white/45">{s.deviceUserAgent || "Unknown UA"}</p>
                    <p className="text-xs text-white/40">
                      {s.ipAddress ? `${s.ipAddress} · ` : ""}
                      {s.createdAt ? new Date(s.createdAt).toLocaleString() : "active"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 w-full rounded-xl bg-red-500/20 border border-red-400/40 py-3 font-anglo-japanese text-lg text-red-200 transition-colors hover:bg-red-500/30"
        >
          Sign out
        </button>
      </div>
    </main>
  )
}
