import { prisma, awardProgress, ensureStats } from './progressService';
import type { PracticeSource } from './progressService';
import * as scheduler from './schedulerClient';

export type ReviewResultInput = {
  id: string;
  clicks?: number;
  time?: number;
  submission: boolean;
  mouse_movements?: number;
  tab_change?: boolean;
};

export type OutcomeInput = { id: string; correct: boolean; partial?: boolean };

export type SrsSource = 'srs' | 'game1' | 'game2' | 'talk' | 'chat' | 'listen' | 'story';

/**
 * Per-source review profiles.
 * The Python FSRS reviewer rates from behaviour signals:
 *   submission=false            -> Again
 *   submission && (clicks>5 || time>30) -> Hard
 *   submission && (clicks>3 || time>20) -> Good
 *   otherwise                   -> Easy
 *
 * Each practice mode is different evidence of memory strength, so each
 * source maps correct/partial/wrong onto different signals:
 *  - game1  recognition (multiple choice) — correct is only "Good"
 *  - game2  timed recall (shooter)        — correct under pressure is "Easy"
 *  - talk   production (speaking)         — correct is "Easy", corrected is "Hard"
 *  - chat   written production            — correct "Good", wrong "Hard" (peer context)
 *  - listen listening comprehension       — correct "Good", wrong "Again"
 */
const SOURCE_PROFILES: Record<
  SrsSource,
  { correct: ReviewResultInput; partial: ReviewResultInput; wrong: ReviewResultInput }
> = {
  srs: {
    correct: { id: '', submission: true, clicks: 1, time: 8 }, // Easy
    partial: { id: '', submission: true, clicks: 5, time: 22 }, // Hard
    wrong: { id: '', submission: false, clicks: 6, time: 35 }, // Again
  },
  game1: {
    correct: { id: '', submission: true, clicks: 4, time: 15 }, // Good
    partial: { id: '', submission: true, clicks: 5, time: 25 }, // Hard
    wrong: { id: '', submission: false, clicks: 6, time: 30 }, // Again
  },
  game2: {
    correct: { id: '', submission: true, clicks: 1, time: 6 }, // Easy
    partial: { id: '', submission: true, clicks: 4, time: 21 }, // Good
    wrong: { id: '', submission: false, clicks: 6, time: 30 }, // Again
  },
  talk: {
    correct: { id: '', submission: true, clicks: 1, time: 10 }, // Easy
    partial: { id: '', submission: true, clicks: 6, time: 32 }, // Hard
    wrong: { id: '', submission: false, clicks: 6, time: 35 }, // Again
  },
  chat: {
    correct: { id: '', submission: true, clicks: 4, time: 18 }, // Good
    partial: { id: '', submission: true, clicks: 6, time: 32 }, // Hard
    wrong: { id: '', submission: true, clicks: 6, time: 32 }, // Hard (typing has help)
  },
  listen: {
    correct: { id: '', submission: true, clicks: 4, time: 18 }, // Good
    partial: { id: '', submission: true, clicks: 5, time: 25 }, // Hard
    wrong: { id: '', submission: false, clicks: 6, time: 30 }, // Again
  },
  story: {
    correct: { id: '', submission: true, clicks: 4, time: 18 }, // Good
    partial: { id: '', submission: true, clicks: 5, time: 25 }, // Hard
    wrong: { id: '', submission: false, clicks: 6, time: 30 }, // Again
  },
};

/** XP per correct answer differs by effort each mode demands. */
const SOURCE_XP: Record<SrsSource, { correct: number; wrong: number }> = {
  srs: { correct: 12, wrong: 3 },
  game1: { correct: 8, wrong: 2 },
  game2: { correct: 10, wrong: 2 },
  talk: { correct: 15, wrong: 4 },
  chat: { correct: 8, wrong: 3 },
  listen: { correct: 12, wrong: 3 },
  story: { correct: 8, wrong: 2 },
};

/** Convert simple correct/partial/wrong outcomes into FSRS review signals. */
export function outcomesToResults(outcomes: OutcomeInput[], source: SrsSource): ReviewResultInput[] {
  const profile = SOURCE_PROFILES[source] || SOURCE_PROFILES.srs;
  return outcomes.map((o) => {
    const base = o.correct ? (o.partial ? profile.partial : profile.correct) : profile.wrong;
    return { ...base, id: String(o.id) };
  });
}

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
  source: SrsSource = 'srs'
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
  const xpRates = SOURCE_XP[source] || SOURCE_XP.srs;
  const xpGained = correct * xpRates.correct + wrong * xpRates.wrong + 5; // +5 session bonus

  const { stats } = await awardProgress(userId, { xpGained, source: source as PracticeSource });

  try {
    const { completeQuest, addDailyXp } = await import('./learningService');
    await addDailyXp(userId, xpGained);
    if (source === 'srs') await completeQuest(userId, 'srs', 'srs');
    if (source === 'game1' || source === 'game2') await completeQuest(userId, 'game', source);
  } catch {
    /* learning hooks are best-effort */
  }

  return {
    stats,
    xpGained,
    reviewed: normalized.length,
    correct,
    review_logs: reviewed.review_logs,
  };
}

/** Submit simple outcomes; per-source profile decides the FSRS rating. */
export async function submitOutcomes(
  userId: string,
  outcomes: OutcomeInput[],
  source: SrsSource
) {
  if (!outcomes.length) throw new Error('outcomes required');
  return submitReview(userId, outcomesToResults(outcomes, source), source);
}

/** Queue known word IDs as practice events (talk/chat vocab). */
export async function queueWordReviews(
  userId: string,
  items: Array<{ id: string; correct: boolean; partial?: boolean }>,
  source: SrsSource = 'talk'
) {
  if (!items.length) return null;
  return submitOutcomes(userId, items, source);
}
