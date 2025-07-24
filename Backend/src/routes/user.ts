import express from 'express';
import { registerUser } from '../controllers/user';
const userRouter= express.Router();

userRouter.use('/users',registerUser);

export default userRouter;