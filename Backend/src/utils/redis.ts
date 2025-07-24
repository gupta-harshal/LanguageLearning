import Redis from 'ioredis';

export const redis = new Redis({
  host: 'localhost', // or your Redis server
  port: 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});