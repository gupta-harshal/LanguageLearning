import { JwtPayload } from '../utils/jwt'; // adjust based on your project structure

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload; // your payload structure (userId, jti, etc.)
    }
  }
}