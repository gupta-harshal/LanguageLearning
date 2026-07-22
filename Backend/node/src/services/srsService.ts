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

/** Local deck used when the Python scheduler is asleep / misconfigured. */
const FALLBACK_DECK = [
  { id: 'fb-1', word: '水', meaning: 'water', furigana: 'みず', romaji: 'mizu', level: 5 },
  { id: 'fb-2', word: '火', meaning: 'fire', furigana: 'ひ', romaji: 'hi', level: 5 },
  { id: 'fb-3', word: '木', meaning: 'tree', furigana: 'き', romaji: 'ki', level: 5 },
  { id: 'fb-4', word: '山', meaning: 'mountain', furigana: 'やま', romaji: 'yama', level: 5 },
  { id: 'fb-5', word: '川', meaning: 'river', furigana: 'かわ', romaji: 'kawa', level: 5 },
  { id: 'fb-6', word: '日', meaning: 'sun / day', furigana: 'ひ', romaji: 'hi', level: 5 },
  { id: 'fb-7', word: '月', meaning: 'moon / month', furigana: 'つき', romaji: 'tsuki', level: 5 },
  { id: 'fb-8', word: '人', meaning: 'person', furigana: 'ひと', romaji: 'hito', level: 5 },
  { id: 'fb-9', word: '食べる', meaning: 'to eat', furigana: 'たべる', romaji: 'taberu', level: 5 },
  { id: 'fb-10', word: '行く', meaning: 'to go', furigana: 'いく', romaji: 'iku', level: 5 },
  { id: 'fb-11', word: '大きい', meaning: 'big', furigana: 'おおきい', romaji: 'ookii', level: 5 },
  { id: 'fb-12', word: '小さい', meaning: 'small', furigana: 'ちいさい', romaji: 'chiisai', level: 5 },
];

async function ensureSrsRow(userId: string) {
  let row = await prisma.userSrs.findUnique({ where: { userId } });
  if (row) return row;
  row = await prisma.userSrs.create({
    data: {
      userId,
      experience: 0,
      maxTimeMin: 15,
      scheduler: {},
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
    ready: true,
    schedulerOnline: healthy,
    mode: healthy ? 'fsrs' : 'fallback',
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

  const existing = await ensureSrsRow(userId);
  if (existing.scheduler && Object.keys(existing.scheduler as object).length > 0) {
    return existing;
  }

  try {
    const { scheduler: sched } = await scheduler.initializeScheduler({
      maximumTime: maxTimeMin,
      experience,
    });
    return prisma.userSrs.update({
      where: { userId },
      data: { experience, maxTimeMin, scheduler: sched as object },
    });
  } catch (err) {
    console.warn('[srs] bootstrap scheduler unavailable, using fallback mode', err);
    return prisma.userSrs.update({
      where: { userId },
      data: { experience, maxTimeMin },
    });
  }
}

export async function fetchDueCards(userId: string) {
  const row = await ensureSrsRow(userId);
  const completed = (row.completed as Record<string, unknown>) || {};
  const overview = await getSrsOverview(userId);

  try {
    const data = await scheduler.getCards(completed);
    const cards = (data.result || []).map((c) => ({
      id: String(c.id ?? ''),
      word: String(c.word ?? c.expression ?? ''),
      meaning: String(c.meaning ?? c.definition ?? ''),
      furigana: c.furigana != null ? String(c.furigana) : '',
      romaji: c.romaji != null ? String(c.romaji) : '',
      level: typeof c.level === 'number' ? c.level : Number(c.level) || 0,
    }));
    return { cards, overview, mode: 'fsrs' as const };
  } catch (err) {
    console.warn('[srs] getCards failed — serving fallback deck', err);
    // Rotate fallback so sessions aren't identical
    const done = new Set(Object.keys(completed));
    const fresh = FALLBACK_DECK.filter((c) => !done.has(c.id));
    const pool = fresh.length >= 6 ? fresh : FALLBACK_DECK;
    const cards = [...pool].sort(() => Math.random() - 0.5).slice(0, 8);
    return {
      cards,
      overview: { ...overview, schedulerOnline: false, mode: 'fallback' },
      mode: 'fallback' as const,
    };
  }
}

export async function submitReview(
  userId: string,
  results: ReviewResultInput[],
  source: SrsSource = 'srs'
) {
  if (!results.length) {
    throw new Error('results required');
  }

  await ensureSrsRow(userId);
  const fresh = await prisma.userSrs.findUniqueOrThrow({ where: { userId } });

  const normalized = results.map((r) => ({
    id: String(r.id),
    clicks: Number(r.clicks) || 1,
    time: Number(r.time) || 10,
    mouse_movements: Number(r.mouse_movements) || 0,
    tab_change: Boolean(r.tab_change),
    submission: Boolean(r.submission),
  }));

  let reviewLogs: unknown = null;
  const online = await scheduler.schedulerHealth();
  const hasScheduler =
    online && fresh.scheduler && Object.keys(fresh.scheduler as object).length > 0;

  if (hasScheduler) {
    try {
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
      reviewLogs = reviewed.review_logs;
    } catch (err) {
      console.warn('[srs] review failed — recording local progress only', err);
      await markLocalCompleted(userId, normalized);
    }
  } else {
    await markLocalCompleted(userId, normalized);
  }

  const correct = normalized.filter((r) => r.submission).length;
  const wrong = normalized.length - correct;
  const xpRates = SOURCE_XP[source] || SOURCE_XP.srs;
  const xpGained = correct * xpRates.correct + wrong * xpRates.wrong + 5;

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
    review_logs: reviewLogs,
    mode: hasScheduler ? 'fsrs' : 'fallback',
  };
}

async function markLocalCompleted(
  userId: string,
  results: Array<{ id: string; submission: boolean }>
) {
  const row = await prisma.userSrs.findUniqueOrThrow({ where: { userId } });
  const completed = { ...((row.completed as Record<string, unknown>) || {}) };
  for (const r of results) {
    completed[r.id] = {
      id: r.id,
      local: true,
      lastResult: r.submission ? 'good' : 'again',
      at: new Date().toISOString(),
    };
  }
  await prisma.userSrs.update({
    where: { userId },
    data: { completed: completed as object },
  });
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
