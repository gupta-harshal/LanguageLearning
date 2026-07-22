import { Router } from "express";
import authRouter from "./auth";
import checkRouter from "./check";
import transcriptionRouter from "./transcription";
import chatRouter from "./chat";
import srsRouter from "./srs";
import learningRouter from "./learning";
import { globalIpLimit } from "../middlewares/rateLimit";

const router = Router();

router.use(globalIpLimit);

router.use('/users', authRouter);
router.use('/', checkRouter);
router.use('/chat', chatRouter);
router.use('/srs', srsRouter);
router.use('/learn', learningRouter);
router.use('/audio&textcomms', transcriptionRouter);
router.use('/audio', transcriptionRouter);

export default router;
