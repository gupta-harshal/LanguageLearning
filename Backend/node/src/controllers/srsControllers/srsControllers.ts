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
    const results = Array.isArray(req.body?.results) ? req.body.results : [];
    const source = req.body?.source || 'srs';
    const data = await srs.submitReview(req.user!.id, results, source);
    res.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Review failed';
    res.status(400).json({ message });
  }
};

/** Lightweight XP ping from any feature without a full FSRS review */
export const practicePing = async (req: Request, res: Response) => {
  const xpGained = Math.min(50, Math.max(1, Number(req.body?.xpGained) || 5));
  const source = req.body?.source || 'manual';
  const { stats } = await awardProgress(req.user!.id, { xpGained, source });
  res.json({ stats, xpGained });
};
