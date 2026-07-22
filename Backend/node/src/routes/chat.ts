import { Router } from 'express';
import { authenticate } from '../middlewares/authentication';
import { chatUserLimit } from '../middlewares/rateLimit';
import {
  characterChat,
  clearTalkHistory,
} from '../controllers/chatControllers/characterChat';

const chatRouter = Router();

chatRouter.post('/character', authenticate, chatUserLimit, characterChat);
chatRouter.delete('/character', authenticate, clearTalkHistory);

export default chatRouter;
