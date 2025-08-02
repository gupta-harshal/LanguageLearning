import { Router } from "express";
import authRouter from "./auth";
import checkRouter from "./check";
const router=Router();

router.use('/users',authRouter);
router.use('/',checkRouter);
export default router;