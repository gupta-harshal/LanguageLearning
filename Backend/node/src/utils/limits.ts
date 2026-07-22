/**
 * Usage / resource caps for free-tier survival (Redis + OpenAI).
 * Override any of these with env vars if needed.
 */
export const LIMITS = {
  // Redis session keys auto-expire with the JWT (7 days)
  SESSION_TTL_SECONDS: 7 * 24 * 60 * 60,
  // Cap concurrent devices so Redis doesn't fill with abandoned sessions
  MAX_SESSIONS_PER_USER: 3,

  // Per-IP sliding windows (Redis counters with short TTL)
  IP_GLOBAL_PER_MINUTE: 120,
  IP_AUTH_PER_HOUR: 60, // login + signup — was too tight for demos
  IP_SIGNUP_PER_DAY: 10,

  // Per-user daily quotas (expensive / paid APIs)
  USER_TTS_PER_DAY: 60,
  USER_CHECK_PER_DAY: 40,
  USER_STATS_WRITES_PER_DAY: 120,
  USER_CHAT_PER_DAY: 80,

  // TTS payload safety (dialogue turns need a bit more room)
  TTS_MAX_CHARS: 280,
} as const

export function envInt(name: string, fallback: number): number {
  const raw = process.env[name]
  if (!raw) return fallback
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : fallback
}
