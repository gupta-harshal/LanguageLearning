import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { api, clearToken, getToken, setToken } from "../api/client"

export type User = {
  id: string
  name: string
  email: string
}

export type SessionInfo = {
  jti?: string
  createdAt?: string
  deviceUserAgent?: string
  ipAddress?: string
  current?: boolean
}

type AuthContextType = {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  logoutOthers: () => Promise<void>
  fetchSessions: () => Promise<SessionInfo[]>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const loadMe = async () => {
    if (!getToken()) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const data = await api<{ user: User }>("/users/me")
      setUser(data.user)
    } catch {
      // token invalid/expired — client already cleared it on 401
      clearToken()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadMe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (email: string, password: string) => {
    const data = await api<{ token: string }>("/users/login", {
      method: "POST",
      auth: false,
      body: { email, password },
    })
    setToken(data.token)
    await loadMe()
  }

  const signup = async (name: string, email: string, password: string) => {
    const data = await api<{ token: string }>("/users/signup", {
      method: "POST",
      auth: false,
      body: { name, email, password },
    })
    setToken(data.token)
    await loadMe()
  }

  const logout = async () => {
    try {
      await api("/users/logout", { method: "POST" })
    } catch {
      /* ignore network errors on logout */
    }
    clearToken()
    setUser(null)
  }

  const logoutOthers = async () => {
    await api("/users/logout-others", { method: "POST" })
  }

  const fetchSessions = async (): Promise<SessionInfo[]> => {
    const data = await api<{ sessions: (SessionInfo | string | null)[] }>("/users/sessions")
    return (data.sessions || [])
      .map((s) => (typeof s === "string" ? (safeParse(s) as SessionInfo) : s))
      .filter((s): s is SessionInfo => !!s)
  }

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    logoutOthers,
    fetchSessions,
    refresh: loadMe,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}
