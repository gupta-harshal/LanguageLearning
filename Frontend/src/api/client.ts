// Central API client for the Node backend (Bearer-token auth).
// Backend base: http://localhost:3000/api/v1  (override with VITE_API_URL)

export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:3000/api/v1"

const TOKEN_KEY = "authToken"

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = "ApiError"
  }
}

type ApiOptions = Omit<RequestInit, "body"> & { body?: unknown; auth?: boolean }

/** JSON request helper. Attaches the Bearer token unless `auth: false`. */
export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, auth = true, headers, ...rest } = options
  const token = getToken()

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  }
  if (auth && token) finalHeaders.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  const data = text ? safeParse(text) : null

  if (!res.ok) {
    let message = res.statusText || "Request failed"
    if (data && typeof data === "object" && "message" in data) {
      message = String((data as { message: unknown }).message)
    }
    if (res.status === 401) clearToken()
    throw new ApiError(res.status, message)
  }

  return data as T
}

/** Binary request helper (e.g. TTS audio). Returns a Blob. */
export async function apiBlob(path: string, body: unknown): Promise<Blob> {
  const token = getToken()
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    if (res.status === 401) clearToken()
    throw new ApiError(res.status, "Request failed")
  }
  return res.blob()
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}
