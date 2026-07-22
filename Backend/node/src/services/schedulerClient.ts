const SCHEDULER_URL = (process.env.SCHEDULER_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${SCHEDULER_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Scheduler ${path} failed (${res.status}): ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

export type SchedulerPrefs = { maximumTime: 10 | 15 | 20; experience: 0 | 1 | 2 };

export async function schedulerHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${SCHEDULER_URL}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function initializeScheduler(prefs: SchedulerPrefs) {
  return post<{ scheduler: Record<string, unknown> }>('/initialize', {
    preference: prefs,
  });
}

export async function reviewCards(payload: {
  scheduler: Record<string, unknown>;
  completed: Record<string, unknown>;
  results: Array<{
    id: string;
    clicks: number;
    time: number;
    mouse_movements?: number;
    tab_change?: boolean;
    submission: boolean;
  }>;
  prefs: SchedulerPrefs;
}) {
  return post<{
    scheduler: Record<string, unknown>;
    completed: Record<string, unknown>;
    review_logs: unknown;
  }>('/review', {
    scheduler: payload.scheduler,
    completed: payload.completed,
    results: payload.results,
    user: {
      preferences: {
        maximumTime: payload.prefs.maximumTime,
        experience: payload.prefs.experience,
      },
    },
  });
}

export async function getCards(completed: Record<string, unknown> | unknown[]) {
  return post<{
    result: Array<Record<string, unknown>>;
    completed: unknown;
  }>('/getCards', { completed });
}

export { SCHEDULER_URL };
