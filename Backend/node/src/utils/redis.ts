import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: 'https://whole-skylark-6474.upstash.io',
  token: process.env.REDIS_TOKEN,
});
