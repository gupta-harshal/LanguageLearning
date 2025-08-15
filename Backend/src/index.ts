import { Sentry } from './instrument';
import express from 'express';
import router from './routes/index';
import dotenv from 'dotenv';
import {Request,Response} from 'express';
import { startAudioBatchServer } from './apis/audiogen';

dotenv.config();

const app = express();

app.use(express.json());
app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  res.send('<h1>Welcome to Language Learning Backend API</h1>');
  setTimeout(() => {
    try {
      throw new Error("Test Sentry logging: deliberate exception");
    } catch (e: unknown) {
      if (e instanceof Error) {
        Sentry.captureException(e);
        Sentry.flush(2000).then(() => {
          console.log("Sentry flushed the error:", e.message);
        });
      } else {
        Sentry.captureException(String(e));
        Sentry.flush(2000).then(() => {
          console.log("Sentry flushed a non-error exception:", String(e));
        });
      }
    }
  }, 99);
});

app.use(Sentry.expressErrorHandler());

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

startAudioBatchServer(4000);
