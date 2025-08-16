import { Router } from "express";
import authRouter from "./auth";
import checkRouter from "./check";
import transcriptionRouter from "./transcription";
const router=Router();

router.use('/users',authRouter);
router.use('/',checkRouter);
router.use('/audio&textcomms',transcriptionRouter);
router.use('/audio',transcriptionRouter);
export default router;