import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { getSession } from '../utils/sessions';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const { userId, jti } = verifyToken(token);
    try {
      const session = await getSession(userId, jti);
      if (!session) return res.status(401).json({ message: 'Session expired or invalid' });
    } catch (err) {
      // Redis blip — trust a valid JWT so login isn't dead
      console.warn('[auth] session lookup failed, allowing JWT', err);
    }

    req.user = { id: userId, jti };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
