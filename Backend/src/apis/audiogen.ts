
import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import axios from "axios";
import FormData from "form-data";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function calculateAccuracy(expected: string, actual: string): number {
  if (!expected) return 0;
  const setA = new Set(expected.toLowerCase().split(/\s+/));
  const setB = new Set(actual.toLowerCase().split(/\s+/));
  const intersectionSize = new Set([...setA].filter(x => setB.has(x))).size;
  const unionSize = new Set([...setA, ...setB]).size;
  return unionSize === 0 ? 0 : (intersectionSize / unionSize) * 100;
}

export function startAudioSocketServer(port: number) {
  const wsApp = express();
  const httpServer = createServer(wsApp);

  const io = new SocketIOServer(httpServer, {
    cors: { origin: process.env.CLIENT_URL }
  });

  io.on("connection", (socket: Socket) => {
    console.log("Audio WS client connected", socket.id);

    socket.on("audio-chunk", async (chunk: ArrayBuffer) => {
      try {
        const formData = new FormData();
        formData.append("file", Buffer.from(chunk), {
          filename: "chunk.webm",
          contentType: "audio/webm"
        });
        formData.append("model", "whisper-1");

        const response = await axios.post(
          "https://api.openai.com/v1/audio/transcriptions",
          formData,
          {
            headers: {
              Authorization: `Bearer ${OPENAI_API_KEY}`,
              ...formData.getHeaders()
            }
          }
        );

        const transcript = response.data.text;
        const expectedText = ""; 
        const accuracy = calculateAccuracy(expectedText, transcript);

        socket.emit("transcription-result", { transcript, accuracy });
      } catch (err) {
        console.error("WS transcription error:", err);
        socket.emit("error", "Transcription failed");
      }
    });

    socket.on("disconnect", () => {
      console.log("Audio WS client disconnected", socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`Audio Socket.IO server running on port ${port}`);
  });
}
