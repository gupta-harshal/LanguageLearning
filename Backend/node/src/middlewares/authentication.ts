import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { getSession } from '../utils/sessions';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const { userId, jti } = verifyToken(token);
    const session = await getSession(userId, jti);
    if (!session) return res.status(401).json({ message: 'Session expired or invalid' });

    req.user = { id: userId, jti };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
