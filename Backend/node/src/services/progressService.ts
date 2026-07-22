import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type PracticeSource =
  | 'srs'
  | 'game1'
  | 'game2'
  | 'talk'
  | 'chat'
  | 'story'
  | 'listen'
  | 'manual';

/** Map raw XP sources onto learner-facing skills. */
export const SKILL_MAP: Record<string, { skill: string; label: string; icon: string }> = {
  srs: { skill: 'vocabulary', label: 'Vocabulary', icon: '🧠' },
  game1: { skill: 'vocabulary', label: 'Vocabulary', icon: '🧠' },
  game2: { skill: 'vocabulary', label: 'Vocabulary', icon: '🧠' },
  talk: { skill: 'speaking', label: 'Speaking', icon: '🗣️' },
  listen: { skill: 'listening', label: 'Listening', icon: '🎧' },
  chat: { skill: 'writing', label: 'Writing', icon: '✍️' },
  story: { skill: 'reading', label: 'Reading', icon: '📖' },
  manual: { skill: 'vocabulary', label: 'Vocabulary', icon: '🧠' },
};

const SKILLS = ['vocabulary', 'speaking', 'listening', 'writing', 'reading'] as const;

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
      badges: [],
      shadowBest: 0,
      sourceXp: {},
    },
  });
}

/**
 * Central XP + streak updater used by SRS, games, talk, chat, listening.
 * Streak counts consecutive UTC calendar days with at least one practice event.
 * Also tracks per-source XP that powers the skill/level tracker.
 */
export async function awardProgress(
  userId: string,
  opts: { xpGained?: number; source?: PracticeSource } = {}
) {
  const xpGained = Math.max(0, Math.floor(Number(opts.xpGained) || 0));
  const source = opts.source || 'manual';
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

  const sourceXp = { ...((current.sourceXp as Record<string, number>) || {}) };
  sourceXp[source] = (Number(sourceXp[source]) || 0) + xpGained;

  const stats = await prisma.userStats.update({
    where: { userId },
    data: {
      xp: newXp,
      level,
      streak,
      longestStreak,
      practiceDays,
      lastActiveDay: today,
      sourceXp,
    },
  });

  return { stats, xpGained, source };
}

export type SkillProgress = {
  skill: string;
  label: string;
  icon: string;
  xp: number;
  level: number;
  /** 0-100 progress toward next level */
  progress: number;
};

/**
 * Collective level tracker.
 * Per-skill XP is the sum of its sources; skill level uses a gentle sqrt curve
 * so early levels come fast and later ones need real work:
 *   level = floor(sqrt(xp / 60)) + 1
 */
export async function getProgressReport(userId: string) {
  const stats = await ensureStats(userId);
  const sourceXp = (stats.sourceXp as Record<string, number>) || {};

  const skillXp: Record<string, number> = {};
  for (const s of SKILLS) skillXp[s] = 0;
  for (const [source, xp] of Object.entries(sourceXp)) {
    const mapped = SKILL_MAP[source];
    if (mapped) skillXp[mapped.skill] += Number(xp) || 0;
  }

  const skills: SkillProgress[] = SKILLS.map((skill) => {
    const xp = skillXp[skill];
    const level = Math.floor(Math.sqrt(xp / 60)) + 1;
    const currFloor = 60 * (level - 1) ** 2;
    const nextFloor = 60 * level ** 2;
    const progress = Math.min(
      100,
      Math.round(((xp - currFloor) / Math.max(1, nextFloor - currFloor)) * 100)
    );
    const meta = Object.values(SKILL_MAP).find((m) => m.skill === skill)!;
    return { skill, label: meta.label, icon: meta.icon, xp, level, progress };
  });

  const overallProgress = Math.min(100, Math.round(((stats.xp % 100) / 100) * 100));

  return {
    overall: {
      xp: stats.xp,
      level: stats.level,
      progress: overallProgress,
      streak: stats.streak,
      longestStreak: stats.longestStreak,
      practiceDays: stats.practiceDays,
      shadowBest: stats.shadowBest,
      badges: stats.badges,
    },
    skills,
    sourceXp,
  };
}

export { prisma };
