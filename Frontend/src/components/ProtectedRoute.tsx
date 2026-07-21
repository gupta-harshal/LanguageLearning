import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function ProtectedRoute({ children }: { children: ReactNode }) {
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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
