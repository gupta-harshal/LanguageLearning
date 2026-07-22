import { Request, Response } from 'express';
import {
  addJournalEntry,
  completeQuest,
  getDaily,
  listJournal,
  pickListenItem,
  questCatalog,
  setShadowBest,
  QuestId,
} from '../../services/learningService';
import { awardProgress } from '../../services/progressService';
import { evaluateBadges } from '../../services/learningService';

export const dailyQuests = async (req: Request, res: Response) => {
  const daily = await getDaily(req.user!.id);
  const badges = await evaluateBadges(req.user!.id);
  res.json({
    daily,
    catalog: questCatalog(),
    badges: badges.badges,
    progress: Math.min(100, Math.round((daily.xpToday / daily.goalXp) * 100)),
  });
};

export const markQuest = async (req: Request, res: Response) => {
  const quest = String(req.body?.quest || '') as QuestId;
  const allowed: QuestId[] = ['srs', 'talk', 'chat', 'game', 'listen', 'journal'];
  if (!allowed.includes(quest)) {
    return res.status(400).json({ message: 'Invalid quest' });
  }
  const result = await completeQuest(req.user!.id, quest, quest === 'game' ? 'game1' : quest === 'talk' ? 'talk' : 'manual');
  res.json(result);
};

export const journalList = async (req: Request, res: Response) => {
  const entries = await listJournal(req.user!.id);
  res.json({ entries });
};

export const journalAdd = async (req: Request, res: Response) => {
  try {
    const entry = await addJournalEntry(req.user!.id, req.body || {});
    res.json({ entry });
  } catch (err: unknown) {
    res.status(400).json({ message: err instanceof Error ? err.message : 'Failed' });
  }
};

export const shadowScore = async (req: Request, res: Response) => {
  const score = Number(req.body?.score) || 0;
  const best = await setShadowBest(req.user!.id, score);
  if (score >= 70) {
    await awardProgress(req.user!.id, { xpGained: Math.round(score / 10), source: 'talk' });
    await completeQuest(req.user!.id, 'talk', 'talk');
  }
  res.json({ best, score: Math.round(score) });
};

export const listenNext = async (req: Request, res: Response) => {
  const item = pickListenItem();
  // Hide the blank answer in the spoken sentence display helper
  res.json({
    id: item.id,
    prompt: item.japanese.replace(item.blank, '____'),
    full: item.japanese,
    reading: item.reading,
    english: item.english,
    hint: item.hint,
    ttsText: item.japanese,
  });
};

export const listenCheck = async (req: Request, res: Response) => {
  const id = String(req.body?.id || '');
  const answer = String(req.body?.answer || '').trim();
  const { LISTEN_BANK } = await import('../../services/learningService');
  const item = LISTEN_BANK.find((x) => x.id === id);
  if (!item) return res.status(404).json({ message: 'Unknown item' });

  const normalize = (s: string) => s.replace(/\s+/g, '').toLowerCase();
  const ok =
    normalize(answer) === normalize(item.blank) ||
    normalize(answer) === normalize(item.hint) ||
    item.japanese.includes(answer);

  if (ok) {
    await awardProgress(req.user!.id, { xpGained: 12, source: 'listen' });
    await completeQuest(req.user!.id, 'listen', 'listen');
  } else {
    await awardProgress(req.user!.id, { xpGained: 2, source: 'listen' });
  }

  res.json({
    correct: ok,
    blank: item.blank,
    full: item.japanese,
    english: item.english,
  });
};
