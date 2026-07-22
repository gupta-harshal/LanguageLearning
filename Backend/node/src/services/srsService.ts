import { prisma, awardProgress, ensureStats } from './progressService';
import * as scheduler from './schedulerClient';

export type ReviewResultInput = {
  id: string;
  clicks?: number;
  time?: number;
  submission: boolean;
  mouse_movements?: number;
  tab_change?: boolean;
};

async function ensureSrs(userId: string) {
  let row = await prisma.userSrs.findUnique({ where: { userId } });
  if (row) return row;

  const experience = 0 as 0 | 1 | 2;
  const maxTimeMin = 15 as 10 | 15 | 20;
  const { scheduler: sched } = await scheduler.initializeScheduler({
    maximumTime: maxTimeMin,
    experience,
  });

  row = await prisma.userSrs.create({
    data: {
      userId,
      experience,
      maxTimeMin,
      scheduler: sched as object,
      completed: {},
    },
  });
  return row;
}

export async function getSrsOverview(userId: string) {
  await ensureStats(userId);
  const row = await prisma.userSrs.findUnique({ where: { userId } });
  const completed = (row?.completed as Record<string, unknown>) || {};
  const cardCount = Object.keys(completed).length;
  const healthy = await scheduler.schedulerHealth();
  return {
    ready: !!row?.scheduler,
    schedulerOnline: healthy,
    experience: row?.experience ?? 0,
    maxTimeMin: row?.maxTimeMin ?? 15,
    cardCount,
  };
}

export async function bootstrapSrs(
  userId: string,
  prefs?: { experience?: number; maxTimeMin?: number }
) {
  const experience = Math.min(2, Math.max(0, Number(prefs?.experience) || 0)) as 0 | 1 | 2;
  const maxTimeMin = ([10, 15, 20].includes(Number(prefs?.maxTimeMin))
    ? Number(prefs?.maxTimeMin)
    : 15) as 10 | 15 | 20;

  const existing = await prisma.userSrs.findUnique({ where: { userId } });
  if (existing?.scheduler) {
    return existing;
  }

  const { scheduler: sched } = await scheduler.initializeScheduler({
    maximumTime: maxTimeMin,
    experience,
  });

  if (existing) {
    return prisma.userSrs.update({
      where: { userId },
      data: { experience, maxTimeMin, scheduler: sched as object },
    });
  }

  return prisma.userSrs.create({
    data: {
      userId,
      experience,
      maxTimeMin,
      scheduler: sched as object,
      completed: {},
    },
  });
}

export async function fetchDueCards(userId: string) {
  const row = await ensureSrs(userId);
  const completed = (row.completed as Record<string, unknown>) || {};
  const data = await scheduler.getCards(completed);
  return {
    cards: data.result || [],
    overview: await getSrsOverview(userId),
  };
}

export async function submitReview(
  userId: string,
  results: ReviewResultInput[],
  source: 'srs' | 'game1' | 'game2' | 'talk' | 'chat' | 'story' = 'srs'
) {
  if (!results.length) {
    throw new Error('results required');
  }

  const row = await ensureSrs(userId);
  if (!row.scheduler) {
    await bootstrapSrs(userId);
  }
  const fresh = await prisma.userSrs.findUniqueOrThrow({ where: { userId } });

  const normalized = results.map((r) => ({
    id: String(r.id),
    clicks: Number(r.clicks) || 1,
    time: Number(r.time) || 10,
    mouse_movements: Number(r.mouse_movements) || 0,
    tab_change: Boolean(r.tab_change),
    submission: Boolean(r.submission),
  }));

  const reviewed = await scheduler.reviewCards({
    scheduler: fresh.scheduler as Record<string, unknown>,
    completed: (fresh.completed as Record<string, unknown>) || {},
    results: normalized,
    prefs: {
      maximumTime: ([10, 15, 20].includes(fresh.maxTimeMin)
        ? fresh.maxTimeMin
        : 15) as 10 | 15 | 20,
      experience: Math.min(2, Math.max(0, fresh.experience)) as 0 | 1 | 2,
    },
  });

  await prisma.userSrs.update({
    where: { userId },
    data: {
      scheduler: reviewed.scheduler as object,
      completed: reviewed.completed as object,
    },
  });

  const correct = normalized.filter((r) => r.submission).length;
  const wrong = normalized.length - correct;
  const xpGained = correct * 12 + wrong * 3 + 5; // session bonus

  const { stats } = await awardProgress(userId, { xpGained, source });

  return {
    stats,
    xpGained,
    reviewed: normalized.length,
    correct,
    review_logs: reviewed.review_logs,
  };
}

/** Queue known word IDs as practice events (talk/chat vocab). */
export async function queueWordReviews(
  userId: string,
  items: Array<{ id: string; correct: boolean }>,
  source: 'talk' | 'chat' | 'game1' | 'game2' = 'talk'
) {
  if (!items.length) return null;

  const results: ReviewResultInput[] = items.map((it) => ({
    id: String(it.id),
    submission: it.correct,
    clicks: it.correct ? 1 : 4,
    time: it.correct ? 8 : 25,
  }));

  return submitReview(userId, results, source);
}
