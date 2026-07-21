import express from 'express';
import * as authController from '../controllers/authControllers/authControllers';
import * as userController from '../controllers/userControllers/userControllers';
import { authenticate } from '../middlewares/authentication';
import {
  authIpLimit,
  signupIpLimit,
  statsWriteLimit,
} from '../middlewares/rateLimit';

const authRouter = express.Router();

authRouter.post('/signup', authIpLimit, signupIpLimit, authController.signup);
authRouter.post('/login', authIpLimit, authController.login);
authRouter.post('/logout', authenticate, authController.logout);
authRouter.get('/sessions', authenticate, authController.sessions);
authRouter.post('/logout-others', authenticate, authController.logoutOthers);

authRouter.get('/me', authenticate, userController.me);
authRouter.get('/stats', authenticate, userController.getStats);
authRouter.post('/stats', authenticate, statsWriteLimit, userController.updateStats);

export default authRouter;
