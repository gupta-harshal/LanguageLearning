import { Router } from "express";
import grammarEngine from "../apis/GrammarEngine";
const checkRouter= Router();
checkRouter.post('/check',grammarEngine);
export default checkRouter;