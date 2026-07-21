import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import type { SessionInfo } from "../context/AuthContext"

export default function Account() {
  const { user, logout, logoutOthers, fetchSessions } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      setSessions(await fetchSessions())
    } catch {
      setNote("Could not load sessions.")
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
      setNote("Signed out of all other devices.")
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

        {/* Profile card */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-indigo-500 text-2xl font-bold">
              {user?.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="text-xl font-semibold">{user?.name}</p>
              <p className="text-white/60 text-sm">{user?.email}</p>
            </div>
          </div>
        </section>

        {/* Devices */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
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

          {note && <p className="mb-3 text-sm text-white/70">{note}</p>}

          {loading ? (
            <p className="text-white/50">Loading…</p>
          ) : sessions.length === 0 ? (
            <p className="text-white/50">No active sessions found.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {sessions.map((s, i) => (
                <li key={i} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="text-xl">💻</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm">{s.deviceUserAgent || "Unknown device"}</p>
                    <p className="text-xs text-white/50">
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
