import { redis } from './redis'
import { LIMITS } from './limits'

const SESSION_TTL = LIMITS.SESSION_TTL_SECONDS
export const MAX_DEVICES = LIMITS.MAX_SESSIONS_PER_USER

export type SessionMeta = {
  jti?: string
  createdAt: string
  deviceUserAgent?: string
  ipAddress?: string
  label?: string
}

function sessionKey(userId: string, jti: string) {
  return `session:${userId}:${jti}`
}

function indexKey(userId: string) {
  return `sessions:index:${userId}`
}

function deviceLabel(ua?: string) {
  const s = (ua || 'unknown').toLowerCase()
  if (s.includes('iphone') || s.includes('ipad')) return 'iOS'
  if (s.includes('android')) return 'Android'
  if (s.includes('mac')) return 'Mac'
  if (s.includes('windows')) return 'Windows'
  if (s.includes('linux')) return 'Linux'
  return 'Device'
}

/** Create session; if over MAX_DEVICES, evict oldest until ≤ 3. */
export async function createSession(userId: string, jti: string, meta: Omit<SessionMeta, 'jti' | 'label'>) {
  const key = sessionKey(userId, jti)
  const index = indexKey(userId)
  const payload: SessionMeta = {
    ...meta,
    jti,
    label: deviceLabel(meta.deviceUserAgent),
  }

  await redis.set(key, JSON.stringify(payload), { ex: SESSION_TTL })
  await redis.sadd(index, jti)
  await redis.expire(index, SESSION_TTL)

  let evicted = 0
  const members = await redis.smembers(index)
  if (members.length > MAX_DEVICES) {
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
    const toDrop = dated.slice(0, dated.length - MAX_DEVICES)
    await Promise.all(
      toDrop.map(async ({ id }) => {
        await redis.del(sessionKey(userId, id))
        await redis.srem(index, id)
        evicted += 1
      })
    )
  }

  const active = (await redis.smembers(index)).length
  return { active, max: MAX_DEVICES, evicted }
}

export async function getSession(userId: string, jti: string) {
  return redis.get(sessionKey(userId, jti))
}

export async function deleteSession(userId: string, jti: string) {
  await redis.del(sessionKey(userId, jti))
  await redis.srem(indexKey(userId), jti)
}

export async function listSessionsDetailed(userId: string, currentJti?: string): Promise<SessionMeta[]> {
  const members = await redis.smembers(indexKey(userId))
  if (!members.length) return []

  const results = await Promise.all(
    members.map(async (jti) => {
      const raw = await redis.get(sessionKey(userId, jti))
      if (!raw) {
        await redis.srem(indexKey(userId), jti)
        return null
      }
      let meta: SessionMeta
      if (typeof raw === 'string') {
        try {
          meta = JSON.parse(raw) as SessionMeta
        } catch {
          return null
        }
      } else {
        meta = raw as SessionMeta
      }
      return {
        ...meta,
        jti,
        label: meta.label || deviceLabel(meta.deviceUserAgent),
        current: currentJti ? jti === currentJti : false,
      } as SessionMeta & { current?: boolean }
    })
  )
  return results.filter(Boolean) as SessionMeta[]
}

/** @deprecated use listSessionsDetailed */
export async function listSessions(userId: string): Promise<(SessionMeta | null)[]> {
  return listSessionsDetailed(userId)
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

export async function countSessions(userId: string) {
  return (await redis.smembers(indexKey(userId))).length
}
