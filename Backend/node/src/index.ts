import { Sentry } from './instrument';
import express from 'express';
import cors from 'cors';
import http from 'http';
import router from './routes/index';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { startAudioBatchServer } from './apis/audiogen';
import { attachChatRooms } from './services/chatRooms';

dotenv.config();

const app = express();

const frontendOrigin = process.env.FRONTEND_URL;
const corsOrigins = frontendOrigin
  ? [frontendOrigin, 'http://localhost:5173', 'http://localhost:5175']
  : true;

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: '32kb' }));
app.set('trust proxy', 1);
app.use('/api/v1', router);

app.get('/', (_req: Request, res: Response) => {
  res.send('<h1>Welcome to Language Learning Backend API</h1>');
});

app.use(Sentry.expressErrorHandler());

const PORT = Number(process.env.PORT) || 3000;
const server = http.createServer(app);

// Chat rooms share the same HTTP port (works on Render)
attachChatRooms(server, corsOrigins);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const audioPort = process.env.AUDIO_PORT
  ? Number(process.env.AUDIO_PORT)
  : process.env.NODE_ENV === 'production'
    ? null
    : 4000;
if (audioPort) {
  startAudioBatchServer(audioPort);
}
