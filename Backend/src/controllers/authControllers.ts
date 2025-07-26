import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../generated/prisma';
import { generateToken, verifyToken } from '../utils/jwt';
import { redis } from '../utils/redis';

const prisma = new PrismaClient();

export const signup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  const { token, jti } = generateToken(user.id);
  await redis.set(
    `session:${user.id}:${jti}`,
    JSON.stringify({ createdAt: new Date().toISOString() }),
  );

  res.json({ token });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const { token, jti } = generateToken(user.id);
  await redis.set(`session:${user.id}:${jti}`, JSON.stringify({ createdAt: new Date().toISOString() }));

  res.json({ token });
};

export const logout = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(400).json({ message: 'No token provided' });

  const { userId, jti } = verifyToken(token);
  await redis.del(`session:${userId}:${jti}`);

  res.json({ message: 'Logged out' });
};

export const sessions = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const keys = await redis.keys(`session:${userId}:*`);
  const allSessions = await Promise.all(keys.map(key => redis.get(key)));

  res.json({ sessions: allSessions });
};

export const logoutOthers = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(400).json({ message: 'No token provided' });

  const { userId, jti: currentJti } = verifyToken(token);

  const keys = await redis.keys(`session:${userId}:*`);
  const otherSessions = keys.filter(key => !key.endsWith(currentJti));
  await Promise.all(otherSessions.map(key => redis.del(key)));

  res.json({ message: 'Other sessions logged out' });
};
