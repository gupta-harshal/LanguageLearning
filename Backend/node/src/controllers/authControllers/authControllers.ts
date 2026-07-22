import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateToken, verifyToken } from '../../utils/jwt';
import {
  createSession,
  deleteOtherSessions,
  deleteSession,
  listSessionsDetailed,
  MAX_DEVICES,
} from '../../utils/sessions';

const prisma = new PrismaClient();

export const signup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: String(name).slice(0, 80),
        email: String(email).toLowerCase().trim().slice(0, 120),
        password: hashedPassword,
      },
    });

    const { token, jti } = generateToken(user.id);
    const devices = await createSession(user.id, jti, {
      createdAt: new Date().toISOString(),
      deviceUserAgent: String(req.headers['user-agent'] || 'unknown').slice(0, 200),
      ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
    });

    res.json({ token, devices: { ...devices, max: MAX_DEVICES } });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2002') {
      return res.status(409).json({ message: 'Email already registered' });
    }
    throw err;
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email: String(email || '').toLowerCase().trim() },
  });
  if (!user || !(await bcrypt.compare(String(password || ''), user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const { token, jti } = generateToken(user.id);
  const devices = await createSession(user.id, jti, {
    createdAt: new Date().toISOString(),
    deviceUserAgent: String(req.headers['user-agent'] || 'unknown').slice(0, 200),
    ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
  });

  res.json({
    token,
    devices: {
      ...devices,
      max: MAX_DEVICES,
      message:
        devices.evicted > 0
          ? `Signed in. Oldest device was signed out (max ${MAX_DEVICES} devices).`
          : `Signed in (${devices.active}/${MAX_DEVICES} devices).`,
    },
  });
};

export const logout = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(400).json({ message: 'No token provided' });

  const { userId, jti } = verifyToken(token);
  await deleteSession(userId, jti);

  res.json({ message: 'Logged out' });
};

export const sessions = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const currentJti = req.user!.jti;
  const allSessions = await listSessionsDetailed(userId, currentJti);
  res.json({
    sessions: allSessions,
    maxDevices: MAX_DEVICES,
    active: allSessions.length,
  });
};

export const logoutOthers = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(400).json({ message: 'No token provided' });

  const { userId, jti: currentJti } = verifyToken(token);
  await deleteOtherSessions(userId, currentJti);

  res.json({ message: 'Other sessions logged out', active: 1, maxDevices: MAX_DEVICES });
};
