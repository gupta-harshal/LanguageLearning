import { Router } from "express";
import { authenticate } from "../middlewares/authentication";
import { ttsUserLimit } from "../middlewares/rateLimit";
import TTS from "../apis/textToSpeech";

const transcriptionRouter = Router();

transcriptionRouter.post('/TTS', authenticate, ttsUserLimit, TTS);
transcriptionRouter.get('/', (_req, res) => {
  res.status(200).json({ message: "Welcome to the Transcription API" });
});

export default transcriptionRouter;
