import { Router } from "express";
import grammarEngine from "../apis/GrammarEngine";
import { authenticate } from "../middlewares/authentication";
import { checkUserLimit } from "../middlewares/rateLimit";

const checkRouter = Router();
checkRouter.post('/check', authenticate, checkUserLimit, grammarEngine);
export default checkRouter;
