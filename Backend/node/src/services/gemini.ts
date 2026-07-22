/**
 * Gemini helper for chat-room coaching / romaji help.
 * Set GEMINI_API_KEY on Render / local .env
 */
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function geminiCoach(opts: {
  message: string;
  mode?: 'coach' | 'translate' | 'reply';
}): Promise<{ text: string; japanese?: string; tip?: string }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return {
      text: 'Gemini is not configured yet. Add GEMINI_API_KEY to the server env.',
      tip: 'You can still chat with other learners in the room.',
    };
  }

  const mode = opts.mode || 'coach';
  const prompt =
    mode === 'translate'
      ? `Convert this learner message to natural Japanese. Return JSON only: {"japanese":"...","reading":"...","english":"..."}\nMessage: ${opts.message}`
      : mode === 'reply'
        ? `You are a friendly Japanese chat partner. Reply briefly in Japanese (and give english). JSON only: {"japanese":"...","english":"...","tip":"..."}\nUser: ${opts.message}`
        : `You are a Japanese conversation coach in a learner chat room. The user wrote (romaji or Japanese). Give a short correction/tip. JSON only: {"japanese":"improved phrase","english":"...","tip":"..."}\nUser: ${opts.message}`;

  const res = await fetch(`${GEMINI_URL}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 300 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error: ${err.slice(0, 180)}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  const cleaned = raw.replace(/```json|```/g, '').trim();
  try {
    const parsed = JSON.parse(cleaned);
    return {
      text: parsed.english || parsed.tip || cleaned,
      japanese: parsed.japanese,
      tip: parsed.tip,
    };
  } catch {
    return { text: cleaned };
  }
}
