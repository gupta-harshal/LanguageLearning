import express from 'express';
import * as authController from '../controllers/authControllers/authControllers';
import { authenticate } from '../middlewares/authentication';

const authRouter = express.Router();

authRouter.post('/signup', authController.signup);
authRouter.post('/login', authController.login);
authRouter.post('/logout', authenticate, authController.logout);
authRouter.get('/sessions', authenticate, authController.sessions);
authRouter.post('/logout-others', authenticate, authController.logoutOthers);

export default authRouter;
