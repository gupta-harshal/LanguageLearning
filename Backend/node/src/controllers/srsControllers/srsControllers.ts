import { Request, Response } from 'express';
import * as srs from '../../services/srsService';
import { awardProgress } from '../../services/progressService';

export const overview = async (req: Request, res: Response) => {
  try {
    const data = await srs.getSrsOverview(req.user!.id);
    res.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'SRS overview failed';
    res.status(503).json({ message, hint: 'Is the Python scheduler running? Set SCHEDULER_URL.' });
  }
};

export const bootstrap = async (req: Request, res: Response) => {
  try {
    const row = await srs.bootstrapSrs(req.user!.id, req.body || {});
    res.json({
      experience: row.experience,
      maxTimeMin: row.maxTimeMin,
      ready: !!row.scheduler,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'SRS bootstrap failed';
    res.status(503).json({ message, hint: 'Start Backend/python/Scheduler (uvicorn) and set SCHEDULER_URL.' });
  }
};

export const cards = async (req: Request, res: Response) => {
  try {
    const data = await srs.fetchDueCards(req.user!.id);
    res.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch cards';
    res.status(503).json({ message });
  }
};

export const review = async (req: Request, res: Response) => {
  try {
    const source = (req.body?.source || 'srs') as srs.SrsSource;
    const outcomes = Array.isArray(req.body?.outcomes) ? req.body.outcomes : null;
    const results = Array.isArray(req.body?.results) ? req.body.results : [];

    // Either raw FSRS signals (results) or simple outcomes translated per-source
    const data = outcomes
      ? await srs.submitOutcomes(req.user!.id, outcomes, source)
      : await srs.submitReview(req.user!.id, results, source);
    res.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Review failed';
    res.status(400).json({ message });
  }
};

/** Collective skill/level tracker across all practice modes. */
export const progress = async (req: Request, res: Response) => {
  const { getProgressReport } = await import('../../services/progressService');
  const report = await getProgressReport(req.user!.id);
  res.json(report);
};

/** Lightweight XP ping from any feature without a full FSRS review */
export const practicePing = async (req: Request, res: Response) => {
  const xpGained = Math.min(50, Math.max(1, Number(req.body?.xpGained) || 5));
  const source = req.body?.source || 'manual';
  const { stats } = await awardProgress(req.user!.id, { xpGained, source });
  try {
    const { completeQuest, addDailyXp } = await import('../../services/learningService');
    await addDailyXp(req.user!.id, xpGained);
    if (source === 'game1' || source === 'game2') {
      await completeQuest(req.user!.id, 'game', source);
    }
  } catch {
    /* ignore */
  }
  res.json({ stats, xpGained });
};
