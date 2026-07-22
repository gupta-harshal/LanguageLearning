import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import { getSession } from '../utils/sessions';
import { geminiCoach } from './gemini';
import { awardProgress } from './progressService';

type ChatUser = { id: string; name: string };

type RoomMessage = {
  id: string;
  roomId: string;
  userId: string;
  name: string;
  text: string;
  createdAt: string;
  kind: 'user' | 'system' | 'ai';
};

const rooms = new Map<string, Set<string>>(); // roomId -> socketIds
const socketMeta = new Map<string, { user: ChatUser; roomId?: string }>();
const recent = new Map<string, RoomMessage[]>(); // last N messages per room

function pushMessage(roomId: string, msg: RoomMessage) {
  const list = recent.get(roomId) || [];
  list.push(msg);
  if (list.length > 80) list.shift();
  recent.set(roomId, list);
}

export function attachChatRooms(httpServer: HttpServer, corsOrigin?: string | string[] | boolean) {
  const io = new Server(httpServer, {
    path: '/socket.io',
    cors: {
      origin: corsOrigin ?? true,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token =
        (socket.handshake.auth?.token as string) ||
        (socket.handshake.headers.authorization?.split(' ')[1] as string) ||
        '';
      if (!token) return next(new Error('Unauthorized'));
      const { userId, jti } = verifyToken(token);
      const session = await getSession(userId, jti);
      if (!session) return next(new Error('Session expired'));
      const name =
        (socket.handshake.auth?.name as string) ||
        `Learner-${userId.slice(-4)}`;
      socketMeta.set(socket.id, { user: { id: userId, name } });
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket: Socket) => {
    socket.on('join-room', (payload: { roomId?: string }) => {
      const meta = socketMeta.get(socket.id);
      if (!meta) return;

      const roomId = (payload?.roomId || 'lobby').slice(0, 40) || 'lobby';
      if (meta.roomId) {
        socket.leave(meta.roomId);
        rooms.get(meta.roomId)?.delete(socket.id);
      }

      meta.roomId = roomId;
      if (!rooms.has(roomId)) rooms.set(roomId, new Set());
      rooms.get(roomId)!.add(socket.id);
      socket.join(roomId);

      const history = recent.get(roomId) || [];
      socket.emit('room-history', history);
      socket.emit('room-joined', { roomId, members: rooms.get(roomId)!.size });

      const sys: RoomMessage = {
        id: `sys-${Date.now()}`,
        roomId,
        userId: 'system',
        name: 'System',
        text: `${meta.user.name} joined`,
        createdAt: new Date().toISOString(),
        kind: 'system',
      };
      pushMessage(roomId, sys);
      socket.to(roomId).emit('chat-message', sys);
    });

    socket.on('chat-message', async (payload: { text?: string; askAi?: boolean }) => {
      const meta = socketMeta.get(socket.id);
      if (!meta?.roomId) return;
      const text = String(payload?.text || '').trim().slice(0, 500);
      if (!text) return;

      const msg: RoomMessage = {
        id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        roomId: meta.roomId,
        userId: meta.user.id,
        name: meta.user.name,
        text,
        createdAt: new Date().toISOString(),
        kind: 'user',
      };
      pushMessage(meta.roomId, msg);
      io.to(meta.roomId).emit('chat-message', msg);

      // Small XP for practicing in the room
      try {
        await awardProgress(meta.user.id, { xpGained: 2, source: 'chat' });
      } catch {
        /* ignore */
      }

      if (payload?.askAi) {
        try {
          const coach = await geminiCoach({ message: text, mode: 'coach' });
          const ai: RoomMessage = {
            id: `ai-${Date.now()}`,
            roomId: meta.roomId,
            userId: 'gemini',
            name: 'ミケ AI',
            text: [coach.japanese, coach.text, coach.tip].filter(Boolean).join('\n'),
            createdAt: new Date().toISOString(),
            kind: 'ai',
          };
          pushMessage(meta.roomId, ai);
          io.to(meta.roomId!).emit('chat-message', ai);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'AI unavailable';
          socket.emit('chat-error', { message });
        }
      }
    });

    socket.on('ai-reply', async (payload: { text?: string }) => {
      const meta = socketMeta.get(socket.id);
      if (!meta?.roomId) return;
      const text = String(payload?.text || '').trim().slice(0, 500);
      if (!text) return;
      try {
        const coach = await geminiCoach({ message: text, mode: 'reply' });
        const ai: RoomMessage = {
          id: `ai-${Date.now()}`,
          roomId: meta.roomId,
          userId: 'gemini',
          name: 'ミケ AI',
          text: [coach.japanese, coach.text, coach.tip].filter(Boolean).join('\n'),
          createdAt: new Date().toISOString(),
          kind: 'ai',
        };
        pushMessage(meta.roomId, ai);
        io.to(meta.roomId).emit('chat-message', ai);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'AI unavailable';
        socket.emit('chat-error', { message });
      }
    });

    socket.on('disconnect', () => {
      const meta = socketMeta.get(socket.id);
      if (meta?.roomId) {
        rooms.get(meta.roomId)?.delete(socket.id);
      }
      socketMeta.delete(socket.id);
    });
  });

  return io;
}
