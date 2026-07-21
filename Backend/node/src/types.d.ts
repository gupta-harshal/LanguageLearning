import type { AuthUser } from './utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser; // { id, jti } set by authenticate middleware
    }
  }
}

export {};
