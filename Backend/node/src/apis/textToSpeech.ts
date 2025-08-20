import { Request, Response } from "express";
import OpenAI from "openai";
import dotenv from "dotenv"

dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function TTS(req: Request, res: Response) {
  const { text } = req.body;

  try {
    const audio = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "coral",
      input: text,
      response_format: "mp3",
    });
    if(audio){
      console.log("Audio generated successfully");
    }
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", 'inline; filename="speech.mp3"');
    res.send(audio);

  } catch (error: any) {
    res.status(500).json({ error: error.message || "TTS Error" });
  }
}
