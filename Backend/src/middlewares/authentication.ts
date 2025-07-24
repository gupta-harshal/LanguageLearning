import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { redis } from '../utils/redis';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ message: 'Token missing' });

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    const redisKey = `session:${payload.userId}:${payload.jti}`;
    const session = await redis.get(redisKey);

    if (!session) return res.status(401).json({ message: 'Session invalid or expired' });

    req.user = { id: payload.userId };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};