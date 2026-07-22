import { Router } from 'express';
import { authenticate } from '../middlewares/authentication';
import * as learning from '../controllers/learningControllers/learningControllers';

const learningRouter = Router();

learningRouter.get('/daily', authenticate, learning.dailyQuests);
learningRouter.post('/daily/complete', authenticate, learning.markQuest);
learningRouter.get('/journal', authenticate, learning.journalList);
learningRouter.post('/journal', authenticate, learning.journalAdd);
learningRouter.post('/shadow', authenticate, learning.shadowScore);
learningRouter.get('/listen/next', authenticate, learning.listenNext);
learningRouter.post('/listen/check', authenticate, learning.listenCheck);

export default learningRouter;
