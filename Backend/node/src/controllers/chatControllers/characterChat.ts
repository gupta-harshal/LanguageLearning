import { Request, Response } from 'express';
import OpenAI from 'openai';
import { redis } from '../../utils/redis';
import { LIMITS } from '../../utils/limits';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type TalkLevel = 'beginner' | 'elementary' | 'intermediate' | 'advanced';
export type TalkScenario = 'greetings' | 'cafe' | 'shopping' | 'travel' | 'daily';

const LEVEL_GUIDE: Record<TalkLevel, string> = {
  beginner:
    'Learner is absolute beginner (JLPT N5). Use ONLY very short Japanese (5–12 words). Prefer hiragana; simple kanji OK with reading. Speak slowly and warmly.',
  elementary:
    'Learner is elementary (JLPT N4–N5). Short natural sentences. Mix hiragana and basic kanji. Correct politely when wrong.',
  intermediate:
    'Learner is intermediate (JLPT N3–N4). Natural conversational Japanese. Use common grammar. Give brief tips.',
  advanced:
    'Learner is advanced (JLPT N2–N3). Natural adult Japanese; use keigo when the scenario needs it.',
};

const SCENARIO_GUIDE: Record<TalkScenario, string> = {
  greetings: 'Scene: first meeting / casual hello. Stay in greeting and small talk.',
  cafe: 'Scene: ordering at a Japanese café. You are friendly barista ミケ.',
  shopping: 'Scene: convenience store / shop. You are helpful clerk ミケ.',
  travel: 'Scene: directions / trains in Japan. You are kind local ミケ.',
  daily: 'Scene: casual daily chat. You are ミケ, a cheerful Maneki Neko buddy.',
};

type HistoryMsg = { role: 'user' | 'assistant'; content: string };

function historyKey(userId: string) {
  return `talk:history:${userId}`;
}

async function loadHistory(userId: string): Promise<HistoryMsg[]> {
  const raw = await redis.get(historyKey(userId));
  if (!raw) return [];
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as HistoryMsg[];
    } catch {
      return [];
    }
  }
  return Array.isArray(raw) ? (raw as HistoryMsg[]) : [];
}

async function saveHistory(userId: string, history: HistoryMsg[]) {
  await redis.set(historyKey(userId), JSON.stringify(history.slice(-12)), {
    ex: LIMITS.SESSION_TTL_SECONDS,
  });
}

export const clearTalkHistory = async (req: Request, res: Response) => {
  await redis.del(historyKey(req.user!.id));
  res.json({ message: 'Conversation cleared' });
};

/**
 * POST /chat/character
 * Body: { message: string, level?, scenario?, reset? }
 */
export const characterChat = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const message = String(req.body?.message || '').trim().slice(0, 500);
  const level = (req.body?.level || 'beginner') as TalkLevel;
  const scenario = (req.body?.scenario || 'daily') as TalkScenario;
  const reset = Boolean(req.body?.reset);
  const keigo = Boolean(req.body?.keigo);
  const shadow = Boolean(req.body?.shadow);

  if (!message) {
    return res.status(400).json({ message: 'message is required' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ message: 'OPENAI_API_KEY is not configured on the server' });
  }

  if (reset) {
    await redis.del(historyKey(userId));
  }

  const safeLevel: TalkLevel = LEVEL_GUIDE[level] ? level : 'beginner';
  const safeScenario: TalkScenario = SCENARIO_GUIDE[scenario] ? scenario : 'daily';

  const keigoLine = keigo
    ? 'Use polite です/ます style (丁寧語). Prefer 敬語 when appropriate for the scene.'
    : 'Use casual friendly Japanese unless the scene requires politeness.';

  const shadowLine = shadow
    ? 'SHADOW MODE: Give ONE short Japanese sentence for the learner to repeat. Put it in replyJapanese. tip should say "Repeat after ミケ".'
    : '';

  const system = `You are ミケ (Mike), a friendly Maneki Neko Japanese conversation partner on a video call.
${LEVEL_GUIDE[safeLevel]}
${SCENARIO_GUIDE[safeScenario]}
${keigoLine}
${shadowLine}

Rules:
- Stay in character as ミケ.
- Reply primarily in Japanese appropriate for the learner level.
- Keep Japanese replies under 180 characters (for text-to-speech).
- If the learner writes/speaks English, answer in simple Japanese and encourage Japanese.
- If their Japanese has mistakes, continue kindly; put a short fix in "correction".
- Also include "vocabId" when you introduce a useful single word that maps to practice (optional string digit id from common JLPT vocab, or null).
- Return STRICT JSON only (no markdown):
  {
    "replyJapanese": string,
    "replyReading": string,
    "replyEnglish": string,
    "tip": string,
    "correction": string|null,
    "vocabId": string|null
  }`;


  let history = reset ? [] : await loadHistory(userId);

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: system },
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: 'user', content: message },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 400,
      response_format: { type: 'json_object' },
      messages,
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    let parsed: {
      replyJapanese?: string;
      replyReading?: string;
      replyEnglish?: string;
      tip?: string;
      correction?: string | null;
      vocabId?: string | null;
    };
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        replyJapanese: 'もう一度お願いします。',
        replyReading: 'もういちどおねがいします',
        replyEnglish: 'Could you say that again?',
        tip: 'Speak slowly and clearly.',
        correction: null,
        vocabId: null,
      };
    }

    const replyJapanese = String(parsed.replyJapanese || 'こんにちは！').slice(0, 200);
    const payload = {
      replyJapanese,
      replyReading: String(parsed.replyReading || '').slice(0, 220),
      replyEnglish: String(parsed.replyEnglish || '').slice(0, 300),
      tip: String(parsed.tip || '').slice(0, 280),
      correction: parsed.correction ? String(parsed.correction).slice(0, 280) : null,
      vocabId: parsed.vocabId ? String(parsed.vocabId) : null,
      level: safeLevel,
      scenario: safeScenario,
      keigo,
      shadow,
    };

    history = [
      ...history,
      { role: 'user', content: message },
      { role: 'assistant', content: replyJapanese },
    ];
    await saveHistory(userId, history);

    // Central progress pillar — every talk turn feeds streak/XP
    try {
      const { awardProgress } = await import('../../services/progressService');
      await awardProgress(userId, { xpGained: shadow ? 8 : 6, source: 'talk' });
      if (payload.vocabId) {
        const { queueWordReviews } = await import('../../services/srsService');
        await queueWordReviews(userId, [{ id: payload.vocabId, correct: !payload.correction }], 'talk');
      }
    } catch (e) {
      console.warn('talk progress hook failed', e);
    }

    res.json(payload);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Chat failed';
    console.error('characterChat error', msg);
    res.status(500).json({ message: msg });
  }
};
