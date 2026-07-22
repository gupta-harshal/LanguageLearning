import cors from 'cors';
import type { CorsOptions } from 'cors';

/**
 * Allow the configured frontend + local Vite + any *.vercel.app preview.
 * Trailing slashes / http vs https mismatches are normalized.
 */
export function buildCorsOptions(): CorsOptions {
  const raw = (process.env.FRONTEND_URL || '').trim().replace(/\/$/, '');
  const extras = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean);

  const allowlist = new Set<string>([
    ...extras,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'https://language-learning-blue.vercel.app',
  ]);
  if (raw) allowlist.add(raw);

  return {
    origin(origin, callback) {
      // Same-origin / curl / mobile apps often send no Origin
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/$/, '');
      if (allowlist.has(normalized)) return callback(null, true);
      if (/\.vercel\.app$/i.test(new URL(normalized).hostname)) {
        return callback(null, true);
      }
      // Fail open for portfolio demos if FRONTEND_URL was never set
      if (!raw && extras.length === 0) return callback(null, true);
      console.warn(`[cors] blocked origin: ${origin}`);
      callback(null, false);
    },
    credentials: true,
  };
}

/** Socket.io wants a concrete origin list or true */
export function socketCorsOrigin(): string[] | boolean {
  const raw = (process.env.FRONTEND_URL || '').trim().replace(/\/$/, '');
  const list = [
    raw,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'https://language-learning-blue.vercel.app',
  ].filter(Boolean) as string[];
  return list.length ? list : true;
}
