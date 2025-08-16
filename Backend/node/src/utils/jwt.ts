import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET!;

export function generateToken(userId: string) {
  const jti = uuidv4();
  const token = jwt.sign({ userId, jti }, JWT_SECRET, { expiresIn: '7d' });
  return { token, jti };
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { userId: string; jti: string };
}
