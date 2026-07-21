import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const DEMO_KEY = "demoPlays"
/** Guests get this many game/feature opens before login is required. */
const DEMO_LIMIT = 2

function getDemoPlays(): number {
  try {
    return Number(localStorage.getItem(DEMO_KEY) || "0") || 0
  } catch {
    return 0
  }
}

function bumpDemoPlays() {
  try {
    localStorage.setItem(DEMO_KEY, String(getDemoPlays() + 1))
  } catch {
    /* ignore */
  }
}

/**
 * Protects routes. Logged-in users pass through.
 * Guests get a tiny demo allowance (DEMO_LIMIT opens), then must sign in.
 * Set `strict` to skip the demo allowance (account / TTS / etc).
 */
export default function ProtectedRoute({
  children,
  strict = false,
}: {
  children: ReactNode
  strict?: boolean
}) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[100svh] items-center justify-center bg-[#12101c] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-500/30 border-t-pink-500" />
          <p className="font-japanese tracking-widest text-white/70">読み込み中…</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) return <>{children}</>

  if (!strict) {
    const plays = getDemoPlays()
    if (plays < DEMO_LIMIT) {
      bumpDemoPlays()
      return <>{children}</>
    }
  }

  return <Navigate to="/login" replace state={{ from: location.pathname }} />
}
