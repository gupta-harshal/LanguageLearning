import { Request, Response, NextFunction } from 'express'
import { redis } from '../utils/redis'
import { LIMITS, envInt } from '../utils/limits'

type RateLimitOptions = {
  /** Redis key prefix, e.g. "rl:tts" */
  prefix: string
  /** Max hits in the window */
  limit: number
  /** Window length in seconds */
  windowSeconds: number
  /** Who to count against */
  identity: 'ip' | 'user' | 'ip+user'
  message?: string
}

function clientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length) {
    return forwarded.split(',')[0].trim()
  }
  return req.ip || req.socket.remoteAddress || 'unknown'
}

function windowBucket(windowSeconds: number): number {
  return Math.floor(Date.now() / 1000 / windowSeconds)
}

/**
 * Fixed-window counter in Redis. Keys auto-expire = low Redis footprint.
 * Returns 429 when over limit.
 */
export function rateLimit(opts: RateLimitOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ip = clientIp(req)
      const userId = req.user?.id
      let id: string
      if (opts.identity === 'user') {
        if (!userId) return res.status(401).json({ message: 'Unauthorized' })
        id = userId
      } else if (opts.identity === 'ip+user') {
        id = userId ? `u:${userId}` : `ip:${ip}`
      } else {
        id = `ip:${ip}`
      }

      const bucket = windowBucket(opts.windowSeconds)
      const key = `${opts.prefix}:${id}:${bucket}`
      const count = await redis.incr(key)
      if (count === 1) {
        await redis.expire(key, opts.windowSeconds + 5)
      }

      res.setHeader('X-RateLimit-Limit', String(opts.limit))
      res.setHeader('X-RateLimit-Remaining', String(Math.max(0, opts.limit - count)))

      if (count > opts.limit) {
        return res.status(429).json({
          message: opts.message || 'Too many requests. Please slow down.',
          retryAfterSeconds: opts.windowSeconds,
        })
      }
      next()
    } catch (err) {
      // If Redis is down, fail closed on expensive routes is safer — but allow auth reads.
      console.error('rateLimit error', err)
      next()
    }
  }
}

/** Soft global shield for the whole API. */
export const globalIpLimit = rateLimit({
  prefix: 'rl:global',
  limit: envInt('LIMIT_IP_GLOBAL_PER_MINUTE', LIMITS.IP_GLOBAL_PER_MINUTE),
  windowSeconds: 60,
  identity: 'ip',
  message: 'Too many requests from this IP. Try again in a minute.',
})

export const authIpLimit = rateLimit({
  prefix: 'rl:auth',
  limit: envInt('LIMIT_IP_AUTH_PER_HOUR', LIMITS.IP_AUTH_PER_HOUR),
  windowSeconds: 60 * 60,
  identity: 'ip',
  message: 'Too many login/signup attempts. Try again later.',
})

export const signupIpLimit = rateLimit({
  prefix: 'rl:signup',
  limit: envInt('LIMIT_IP_SIGNUP_PER_DAY', LIMITS.IP_SIGNUP_PER_DAY),
  windowSeconds: 24 * 60 * 60,
  identity: 'ip',
  message: 'Signup limit reached for today. Come back tomorrow.',
})

export const ttsUserLimit = rateLimit({
  prefix: 'rl:tts',
  limit: envInt('LIMIT_USER_TTS_PER_DAY', LIMITS.USER_TTS_PER_DAY),
  windowSeconds: 24 * 60 * 60,
  identity: 'user',
  message: 'Daily TTS limit reached (keeps OpenAI costs low). Try again tomorrow.',
})

export const checkUserLimit = rateLimit({
  prefix: 'rl:check',
  limit: envInt('LIMIT_USER_CHECK_PER_DAY', LIMITS.USER_CHECK_PER_DAY),
  windowSeconds: 24 * 60 * 60,
  identity: 'user',
  message: 'Daily grammar-check limit reached. Try again tomorrow.',
})

export const statsWriteLimit = rateLimit({
  prefix: 'rl:stats',
  limit: envInt('LIMIT_USER_STATS_PER_DAY', LIMITS.USER_STATS_WRITES_PER_DAY),
  windowSeconds: 24 * 60 * 60,
  identity: 'user',
  message: 'Too many progress updates today.',
})
