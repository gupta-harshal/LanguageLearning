import { Request, Response } from 'express';
import { ensureStats, awardProgress, prisma } from '../../services/progressService';

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

export const getStats = async (req: Request, res: Response) => {
  const stats = await ensureStats(req.user!.id);
  res.json({ stats });
};

export const updateStats = async (req: Request, res: Response) => {
  const { xpGained = 0, streak } = req.body ?? {};
  const { stats } = await awardProgress(req.user!.id, {
    xpGained: Number(xpGained) || 0,
    source: 'manual',
  });

  if (typeof streak === 'number') {
    const updated = await prisma.userStats.update({
      where: { userId: req.user!.id },
      data: { streak },
    });
    return res.json({ stats: updated });
  }

  res.json({ stats });
};
