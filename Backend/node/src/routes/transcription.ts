import { Router } from "express";
import { authenticate } from "../middlewares/authentication";
import TTS from "../apis/textToSpeech";
const transcriptionRouter =Router();

transcriptionRouter.post('/TTS',TTS);
transcriptionRouter.get('/',(req,res)=>{
  res.status(200).json({message:"Welcome to the Transcription API"});
})
export default transcriptionRouter;