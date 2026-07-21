import { Redis } from '@upstash/redis';

// Prefer env vars so Render can point at a live Upstash DB.
// REST URL looks like: https://xxxx.upstash.io
const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.REDIS_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
  console.warn(
    'Redis is not configured. Set REDIS_URL (or UPSTASH_REDIS_REST_URL) and REDIS_TOKEN on Render.'
  );
}

export const redis = new Redis({
  url: redisUrl || 'https://invalid.upstash.io',
  token: redisToken || 'missing',
});
