import { redis } from './redis'
import { LIMITS } from './limits'

const SESSION_TTL = LIMITS.SESSION_TTL_SECONDS
const MAX_SESSIONS = LIMITS.MAX_SESSIONS_PER_USER

export type SessionMeta = {
  createdAt: string
  deviceUserAgent?: string
  ipAddress?: string
}

function sessionKey(userId: string, jti: string) {
  return `session:${userId}:${jti}`
}

function indexKey(userId: string) {
  return `sessions:index:${userId}`
}

/** Create a session with TTL and enforce max devices (evicts oldest). Avoids redis.keys(). */
export async function createSession(userId: string, jti: string, meta: SessionMeta) {
  const key = sessionKey(userId, jti)
  const index = indexKey(userId)

  await redis.set(key, JSON.stringify(meta), { ex: SESSION_TTL })
  await redis.sadd(index, jti)
  await redis.expire(index, SESSION_TTL)

  // Cap concurrent devices — drop oldest sessions first
  const members = await redis.smembers(index)
  if (members.length > MAX_SESSIONS) {
    const dated = await Promise.all(
      members.map(async (id) => {
        const raw = await redis.get(sessionKey(userId, id))
        let createdAt = 0
        if (typeof raw === 'string') {
          try {
            createdAt = Date.parse(JSON.parse(raw).createdAt) || 0
          } catch {
            createdAt = 0
          }
        } else if (raw && typeof raw === 'object' && 'createdAt' in (raw as object)) {
          createdAt = Date.parse(String((raw as SessionMeta).createdAt)) || 0
        }
        return { id, createdAt }
      })
    )
    dated.sort((a, b) => a.createdAt - b.createdAt)
    const toDrop = dated.slice(0, dated.length - MAX_SESSIONS)
    await Promise.all(
      toDrop.map(async ({ id }) => {
        await redis.del(sessionKey(userId, id))
        await redis.srem(index, id)
      })
    )
  }
}

export async function getSession(userId: string, jti: string) {
  return redis.get(sessionKey(userId, jti))
}

export async function deleteSession(userId: string, jti: string) {
  await redis.del(sessionKey(userId, jti))
  await redis.srem(indexKey(userId), jti)
}

export async function listSessions(userId: string): Promise<(SessionMeta | null)[]> {
  const members = await redis.smembers(indexKey(userId))
  if (!members.length) return []

  const results = await Promise.all(
    members.map(async (jti) => {
      const raw = await redis.get(sessionKey(userId, jti))
      if (!raw) {
        // Clean stale index entries (expired session keys)
        await redis.srem(indexKey(userId), jti)
        return null
      }
      if (typeof raw === 'string') {
        try {
          return JSON.parse(raw) as SessionMeta
        } catch {
          return null
        }
      }
      return raw as SessionMeta
    })
  )
  return results.filter(Boolean) as SessionMeta[]
}

export async function deleteOtherSessions(userId: string, keepJti: string) {
  const members = await redis.smembers(indexKey(userId))
  await Promise.all(
    members
      .filter((jti) => jti !== keepJti)
      .map(async (jti) => {
        await redis.del(sessionKey(userId, jti))
        await redis.srem(indexKey(userId), jti)
      })
  )
}
