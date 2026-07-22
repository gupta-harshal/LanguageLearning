import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import AuthLayout from "../components/Auth/AuthLayout"
import { useAuth } from "../context/AuthContext"
import { ApiError, wakeBackend } from "../api/client"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from || "/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [waking, setWaking] = useState(false)

  // Nudge Render so the free instance is already waking while the user types
  useEffect(() => {
    setWaking(true)
    void wakeBackend().finally(() => setWaking(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 401 ? "Invalid email or password." : err.message)
      } else {
        setError(
          "Could not reach the server. On Render free tier the first start can take ~60s — wait and try again."
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="おかえりなさい — sign in to continue your journey."
      footer={
        <>
          New here?{" "}
          <Link to="/signup" className="font-semibold text-pink-400 hover:text-pink-300">
            Create an account
          </Link>
        </>
      }
    >
      {(waking || loading) && (
        <p className="mb-3 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/90">
          {loading
            ? "Signing in… if this is the first visit in a while, Render may need ~30–60s to wake up."
            : "Waking the backend on Render (free tier cold start)…"}
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoFocus />
        <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />

        {error && (
          <p className="rounded-lg bg-red-500/15 border border-red-500/30 px-3 py-2 text-sm text-red-300">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-500 py-3 font-anglo-japanese text-lg shadow-[0_0_24px_rgba(236,72,153,0.4)] transition-all hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  )
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoFocus?: boolean
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-white/70">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        required
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition-colors focus:border-pink-400/60 focus:bg-white/10"
      />
    </label>
  )
}
