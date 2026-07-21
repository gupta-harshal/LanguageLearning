import { Router } from "express";
import authRouter from "./auth";
import checkRouter from "./check";
import transcriptionRouter from "./transcription";
import { globalIpLimit } from "../middlewares/rateLimit";

const router = Router();

// Soft global shield — every /api/v1 hit counts against IP budget
router.use(globalIpLimit);

router.use('/users', authRouter);
router.use('/', checkRouter);
router.use('/audio&textcomms', transcriptionRouter);
router.use('/audio', transcriptionRouter);

export default router;
