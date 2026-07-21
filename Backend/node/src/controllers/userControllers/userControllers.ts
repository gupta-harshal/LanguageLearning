import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Ensure a UserStats row exists for a user, creating a default one if needed.
async function ensureStats(userId: string) {
  const existing = await prisma.userStats.findUnique({ where: { userId } });
  if (existing) return existing;
  return prisma.userStats.create({
    data: { userId, streak: 0, xp: 0, level: 1 },
  });
}

// GET /users/me — current user profile + stats (used by the frontend to hydrate auth state)
export const me = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!user) return res.status(404).json({ message: 'User not found' });

  const stats = await ensureStats(userId);
  res.json({ user, stats });
};

// GET /users/stats — streak / xp / level for the current user
export const getStats = async (req: Request, res: Response) => {
  const stats = await ensureStats(req.user!.id);
  res.json({ stats });
};

// POST /users/stats — update progress after a game/lesson.
// Body: { xpGained?: number, streak?: number }  (xpGained is added; level derived from xp)
export const updateStats = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { xpGained = 0, streak } = req.body ?? {};

  const current = await ensureStats(userId);
  const newXp = current.xp + Math.max(0, Number(xpGained) || 0);
  const newLevel = Math.floor(newXp / 100) + 1; // 100 xp per level
  const newStreak = typeof streak === 'number' ? streak : current.streak;

  const stats = await prisma.userStats.update({
    where: { userId },
    data: { xp: newXp, level: newLevel, streak: newStreak },
  });

  res.json({ stats });
};
