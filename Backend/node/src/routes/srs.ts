import { Router } from 'express';
import { authenticate } from '../middlewares/authentication';
import * as srsController from '../controllers/srsControllers/srsControllers';
import { rateLimit } from '../middlewares/rateLimit';
import { LIMITS, envInt } from '../utils/limits';

const srsRouter = Router();

const srsLimit = rateLimit({
  prefix: 'rl:srs',
  limit: envInt('LIMIT_USER_SRS_PER_DAY', 80),
  windowSeconds: 24 * 60 * 60,
  identity: 'user',
  message: 'Daily SRS limit reached. Great work — rest and come back tomorrow!',
});

srsRouter.get('/overview', authenticate, srsController.overview);
srsRouter.get('/progress', authenticate, srsController.progress);
srsRouter.post('/bootstrap', authenticate, srsLimit, srsController.bootstrap);
srsRouter.get('/cards', authenticate, srsLimit, srsController.cards);
srsRouter.post('/review', authenticate, srsLimit, srsController.review);
srsRouter.post('/ping', authenticate, srsLimit, srsController.practicePing);

export default srsRouter;
