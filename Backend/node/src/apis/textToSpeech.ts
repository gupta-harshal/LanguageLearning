import { Request, Response } from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import { LIMITS } from "../utils/limits";

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function TTS(req: Request, res: Response) {
  const raw = typeof req.body?.text === "string" ? req.body.text : "";
  const text = raw.trim().slice(0, LIMITS.TTS_MAX_CHARS);

  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: "OPENAI_API_KEY is not configured on the server" });
  }
  if (raw.trim().length > LIMITS.TTS_MAX_CHARS) {
    return res.status(400).json({
      error: `Text too long. Max ${LIMITS.TTS_MAX_CHARS} characters.`,
    });
  }

  try {
    // Prefer mini TTS; fall back to classic tts-1 if the account lacks the newer model
    let audioResponse;
    try {
      audioResponse = await openai.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: "coral",
        input: text,
        response_format: "mp3",
      });
    } catch {
      audioResponse = await openai.audio.speech.create({
        model: "tts-1",
        voice: "nova",
        input: text,
        response_format: "mp3",
      });
    }
    const arrayBuffer = await audioResponse.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", 'inline; filename="speech.mp3"');
    res.send(audioBuffer);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "TTS Error";
    res.status(500).json({ error: message });
  }
}
