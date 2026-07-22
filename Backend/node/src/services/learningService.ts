import { redis } from '../utils/redis';
import { awardProgress, ensureStats, prisma, PracticeSource } from './progressService';

export type QuestId = 'srs' | 'talk' | 'chat' | 'game' | 'listen' | 'journal' | 'story';

const QUEST_META: Record<QuestId, { title: string; blurb: string; xp: number }> = {
  srs: { title: 'Review 5 SRS cards', blurb: 'Open the deck and rate at least one card', xp: 25 },
  talk: { title: 'Talk with ミケ', blurb: 'Complete one video-call turn', xp: 20 },
  chat: { title: 'Chat in Japanese', blurb: 'Send a message in the chat room', xp: 15 },
  game: { title: 'Play a vocab game', blurb: 'Score points in Cloud or Space', xp: 15 },
  listen: { title: 'Listening cloze', blurb: 'Finish one listen-and-fill exercise', xp: 20 },
  journal: { title: 'Save a word', blurb: 'Add a word to your vocab journal', xp: 10 },
  story: { title: 'Read a story', blurb: 'Finish one sliding-window storybook', xp: 20 },
};

function dayKey(userId: string, day = new Date().toISOString().slice(0, 10)) {
  return `daily:${userId}:${day}`;
}

export type DailyState = {
  day: string;
  xpToday: number;
  goalXp: number;
  quests: Record<QuestId, boolean>;
};

const DEFAULT_GOAL = 80;

export async function getDaily(userId: string): Promise<DailyState> {
  const day = new Date().toISOString().slice(0, 10);
  const raw = await redis.get(dayKey(userId, day));
  let parsed: Partial<DailyState> = {};
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }
  } else if (raw && typeof raw === 'object') {
    parsed = raw as DailyState;
  }

  const quests = {
    srs: false,
    talk: false,
    chat: false,
    game: false,
    listen: false,
    journal: false,
    story: false,
    ...(parsed.quests || {}),
  };

  return {
    day,
    xpToday: Number(parsed.xpToday) || 0,
    goalXp: Number(parsed.goalXp) || DEFAULT_GOAL,
    quests,
  };
}

async function saveDaily(userId: string, state: DailyState) {
  await redis.set(dayKey(userId, state.day), JSON.stringify(state), { ex: 60 * 60 * 48 });
}

const BADGE_RULES: Array<{ id: string; label: string; test: (s: { streak: number; xp: number; practiceDays: number; shadowBest: number; journal: number }) => boolean }> = [
  { id: 'first_steps', label: 'First Steps', test: (s) => s.xp >= 10 },
  { id: 'streak_3', label: '3-Day Flame', test: (s) => s.streak >= 3 },
  { id: 'streak_7', label: 'Week Warrior', test: (s) => s.streak >= 7 },
  { id: 'xp_500', label: 'XP Hunter', test: (s) => s.xp >= 500 },
  { id: 'xp_2000', label: 'XP Legend', test: (s) => s.xp >= 2000 },
  { id: 'scholar', label: 'Scholar', test: (s) => s.practiceDays >= 14 },
  { id: 'echo', label: 'Echo Master', test: (s) => s.shadowBest >= 85 },
  { id: 'collector', label: 'Word Collector', test: (s) => s.journal >= 20 },
];

export async function evaluateBadges(userId: string) {
  const stats = await ensureStats(userId);
  const journal = await prisma.vocabJournal.count({ where: { userId } });
  const owned = new Set(stats.badges || []);
  const ctx = {
    streak: stats.streak,
    xp: stats.xp,
    practiceDays: stats.practiceDays,
    shadowBest: stats.shadowBest || 0,
    journal,
  };
  const earned: string[] = [];
  for (const b of BADGE_RULES) {
    if (!owned.has(b.id) && b.test(ctx)) {
      owned.add(b.id);
      earned.push(b.id);
    }
  }
  if (earned.length) {
    await prisma.userStats.update({
      where: { userId },
      data: { badges: Array.from(owned) },
    });
  }
  return {
    badges: Array.from(owned).map((id) => ({
      id,
      label: BADGE_RULES.find((b) => b.id === id)?.label || id,
    })),
    newlyEarned: earned,
  };
}

/** Mark a daily quest complete (idempotent) and award bonus XP once. */
export async function completeQuest(userId: string, quest: QuestId, source?: PracticeSource) {
  const daily = await getDaily(userId);
  if (daily.quests[quest]) {
    return { daily, alreadyDone: true, bonusXp: 0, badges: await evaluateBadges(userId) };
  }
  daily.quests[quest] = true;
  const bonusXp = QUEST_META[quest].xp;
  daily.xpToday += bonusXp;
  await saveDaily(userId, daily);
  await awardProgress(userId, { xpGained: bonusXp, source: source || 'manual' });
  const badges = await evaluateBadges(userId);
  return { daily, alreadyDone: false, bonusXp, badges, meta: QUEST_META[quest] };
}

export async function addDailyXp(userId: string, amount: number) {
  const daily = await getDaily(userId);
  daily.xpToday += Math.max(0, amount);
  await saveDaily(userId, daily);
  return daily;
}

export function questCatalog() {
  return Object.entries(QUEST_META).map(([id, meta]) => ({ id, ...meta }));
}

export async function addJournalEntry(
  userId: string,
  entry: { word: string; reading?: string; meaning?: string; source?: string }
) {
  const word = String(entry.word || '').trim().slice(0, 80);
  if (!word) throw new Error('word required');

  const row = await prisma.vocabJournal.create({
    data: {
      userId,
      word,
      reading: String(entry.reading || '').slice(0, 120),
      meaning: String(entry.meaning || '').slice(0, 200),
      source: String(entry.source || 'manual').slice(0, 40),
    },
  });

  await completeQuest(userId, 'journal', 'manual');
  return row;
}

export async function listJournal(userId: string) {
  return prisma.vocabJournal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}

export async function setShadowBest(userId: string, score: number) {
  const stats = await ensureStats(userId);
  const next = Math.max(stats.shadowBest || 0, Math.min(100, Math.round(score)));
  if (next > (stats.shadowBest || 0)) {
    await prisma.userStats.update({ where: { userId }, data: { shadowBest: next } });
  }
  await evaluateBadges(userId);
  return next;
}

/** Simple listening cloze bank (no Python needed). */
export const LISTEN_BANK = [
  { id: 'l1', japanese: '今日はいい天気ですね。', blank: '天気', reading: 'きょうは いい てんき ですね', english: 'Nice weather today, isn’t it?', hint: 'weather' },
  { id: 'l2', japanese: 'コーヒーを一つお願いします。', blank: 'コーヒー', reading: 'こーひーを ひとつ おねがいします', english: 'One coffee, please.', hint: 'coffee' },
  { id: 'l3', japanese: '駅はどこですか。', blank: '駅', reading: 'えきは どこですか', english: 'Where is the station?', hint: 'station' },
  { id: 'l4', japanese: 'また明日会いましょう。', blank: '明日', reading: 'また あした あいましょう', english: 'See you again tomorrow.', hint: 'tomorrow' },
  { id: 'l5', japanese: '水をください。', blank: '水', reading: 'みずを ください', english: 'Water, please.', hint: 'water' },
  { id: 'l6', japanese: 'これはいくらですか。', blank: 'いくら', reading: 'これは いくらですか', english: 'How much is this?', hint: 'how much' },
];

export function pickListenItem() {
  return LISTEN_BANK[Math.floor(Math.random() * LISTEN_BANK.length)];
}
