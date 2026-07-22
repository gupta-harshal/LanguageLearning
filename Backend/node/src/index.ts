import { Sentry } from './instrument';
import express from 'express';
import cors from 'cors';
import http from 'http';
import router from './routes/index';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { startAudioBatchServer } from './apis/audiogen';
import { attachChatRooms } from './services/chatRooms';
import { buildCorsOptions, socketCorsOrigin } from './utils/cors';

dotenv.config();

const app = express();

app.use(cors(buildCorsOptions()));

app.use(express.json({ limit: '32kb' }));
app.set('trust proxy', 1);
app.use('/api/v1', router);

app.get('/', (_req: Request, res: Response) => {
  res.send('<h1>Welcome to Language Learning Backend API</h1>');
});

app.use(Sentry.expressErrorHandler());

const PORT = Number(process.env.PORT) || 3000;
const server = http.createServer(app);

attachChatRooms(server, socketCorsOrigin());

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
