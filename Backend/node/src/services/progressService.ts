import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type PracticeSource =
  | 'srs'
  | 'game1'
  | 'game2'
  | 'talk'
  | 'chat'
  | 'story'
  | 'manual';

function utcDay(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function yesterdayUtc(d = new Date()): string {
  const y = new Date(d);
  y.setUTCDate(y.getUTCDate() - 1);
  return y.toISOString().slice(0, 10);
}

export async function ensureStats(userId: string) {
  const existing = await prisma.userStats.findUnique({ where: { userId } });
  if (existing) return existing;
  return prisma.userStats.create({
    data: {
      userId,
      streak: 0,
      longestStreak: 0,
      practiceDays: 0,
      xp: 0,
      level: 1,
    },
  });
}

/**
 * Central XP + streak updater used by SRS, games, talk, chat.
 * Streak counts consecutive UTC calendar days with at least one practice event.
 */
export async function awardProgress(
  userId: string,
  opts: { xpGained?: number; source?: PracticeSource } = {}
) {
  const xpGained = Math.max(0, Math.floor(Number(opts.xpGained) || 0));
  const current = await ensureStats(userId);
  const today = utcDay();
  const yday = yesterdayUtc();

  let streak = current.streak;
  let practiceDays = current.practiceDays;
  let longestStreak = current.longestStreak ?? 0;

  if (current.lastActiveDay !== today) {
    if (current.lastActiveDay === yday) {
      streak = (current.streak || 0) + 1;
    } else {
      streak = 1;
    }
    practiceDays = (current.practiceDays || 0) + 1;
  }

  longestStreak = Math.max(longestStreak, streak);
  const newXp = current.xp + xpGained;
  const level = Math.floor(newXp / 100) + 1;

  const stats = await prisma.userStats.update({
    where: { userId },
    data: {
      xp: newXp,
      level,
      streak,
      longestStreak,
      practiceDays,
      lastActiveDay: today,
    },
  });

  return { stats, xpGained, source: opts.source || 'manual' };
}

export { prisma };
