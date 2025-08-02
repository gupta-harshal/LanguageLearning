import { Router } from "express";
import grammarEngine from "../apis/GrammarEngine";
import { authenticate } from "../middlewares/authentication";
const checkRouter= Router();
checkRouter.post('/check',authenticate,grammarEngine);
export default checkRouter;