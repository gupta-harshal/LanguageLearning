import { Sentry } from './instrument';
import express from 'express';
import cors from 'cors'; 
import router from './routes/index';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { startAudioBatchServer } from './apis/audiogen';

dotenv.config();

const app = express();

const frontendOrigin = process.env.FRONTEND_URL; // e.g. https://your-app.vercel.app
app.use(
  cors({
    origin: frontendOrigin ? [frontendOrigin, 'http://localhost:5173', 'http://localhost:5175'] : true,
    credentials: true,
  })
);

app.use(express.json({ limit: '32kb' }));
app.set('trust proxy', 1); // so req.ip / rate limits work behind Render
app.use('/api/v1', router);

app.get('/', (_req: Request, res: Response) => {
  res.send('<h1>Welcome to Language Learning Backend API</h1>');
});

app.use(Sentry.expressErrorHandler());

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Socket.io audio server — only start locally / when AUDIO_PORT is set.
// Render free/web services expose a single HTTP port; skip the second listener in production.
const audioPort = process.env.AUDIO_PORT ? Number(process.env.AUDIO_PORT) : process.env.NODE_ENV === 'production' ? null : 4000;
if (audioPort) {
  startAudioBatchServer(audioPort);
}
