import { Router } from "express";
import { authenticate } from "../middlewares/authentication";
import TTS from "../apis/textToSpeech";
const transcriptionRouter =Router();

transcriptionRouter.post('TTS',TTS);
export default transcriptionRouter;