// Central API client for the Node backend (Bearer-token auth).
// Backend base: http://localhost:3000/api/v1  (override with VITE_API_URL)
//
// Render free tier sleeps after idle — first request can take 30–90s.
// We retry slowly on network / 502–504 so login & SRS don't look "broken".

export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  (import.meta.env.PROD
    ? "https://languagelearning-55vm.onrender.com/api/v1"
    : "http://localhost:3000/api/v1")

const TOKEN_KEY = "authToken"
const IS_PROD_REMOTE = /onrender\.com/i.test(API_URL)

const COLD_START_HINT =
  "Server is waking up on Render (free tier) — this can take up to ~60s. Please wait and try again."

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

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown
  auth?: boolean
  /** Skip cold-start retries (default false) */
  noRetry?: boolean
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function isTransientStatus(status: number) {
  return status === 502 || status === 503 || status === 504 || status === 520
}

async function fetchWithColdStart(
  url: string,
  init: RequestInit,
  noRetry = false
): Promise<Response> {
  const attempts = noRetry || !IS_PROD_REMOTE ? 1 : 4
  let lastErr: unknown

  for (let i = 0; i < attempts; i++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), IS_PROD_REMOTE ? 55_000 : 20_000)
      const res = await fetch(url, { ...init, signal: controller.signal })
      clearTimeout(timeout)

      if (isTransientStatus(res.status) && i < attempts - 1) {
        await sleep(2500 * (i + 1))
        continue
      }
      return res
    } catch (err) {
      lastErr = err
      if (i < attempts - 1) {
        await sleep(2500 * (i + 1))
        continue
      }
    }
  }

  const aborted =
    lastErr instanceof DOMException && lastErr.name === "AbortError"
  throw new ApiError(
    503,
    aborted || IS_PROD_REMOTE
      ? COLD_START_HINT
      : "Could not reach the server. Is the backend running?"
  )
}

/** JSON request helper. Attaches the Bearer token unless `auth: false`. */
export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, auth = true, headers, noRetry, ...rest } = options
  const token = getToken()

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  }
  if (auth && token) finalHeaders.Authorization = `Bearer ${token}`

  const res = await fetchWithColdStart(
    `${API_URL}${path}`,
    {
      ...rest,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    },
    noRetry
  )

  const text = await res.text()
  const data = text ? safeParse(text) : null

  if (!res.ok) {
    let message = res.statusText || "Request failed"
    if (data && typeof data === "object" && "message" in data) {
      message = String((data as { message: unknown }).message)
    }
    if (isTransientStatus(res.status) && IS_PROD_REMOTE) {
      message = COLD_START_HINT
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

  const res = await fetchWithColdStart(`${API_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    if (res.status === 401) clearToken()
    let message = "Request failed"
    if (isTransientStatus(res.status) && IS_PROD_REMOTE) {
      message = COLD_START_HINT
    } else {
      try {
        const data = await res.json()
        if (data?.message || data?.error) message = String(data.message || data.error)
      } catch {
        if (res.status === 429) message = "Daily limit reached. Try again tomorrow."
      }
    }
    throw new ApiError(res.status, message)
  }
  return res.blob()
}

/** Optional: poke the API host so Render starts spinning up before login. */
export async function wakeBackend(): Promise<void> {
  if (!IS_PROD_REMOTE) return
  const base = API_URL.replace(/\/api\/v1\/?$/, "")
  try {
    await fetchWithColdStart(base + "/", { method: "GET" }, false)
  } catch {
    /* UI will show cold-start hint on the real request */
  }
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}
