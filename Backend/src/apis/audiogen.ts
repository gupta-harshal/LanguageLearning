// audioBatchServer.ts
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import axios from "axios";
import FormData from "form-data";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

io.on("connection", (socket: Socket) => {
  console.log("Client connected", socket.id);

  socket.on("audio-batch", async (audioBuffer: ArrayBuffer) => {
    try {
      const formData = new FormData();
      formData.append("file", Buffer.from(audioBuffer), {
        filename: "batch.webm",
        contentType: "audio/webm"
      });
      formData.append("model", "whisper-1");

      const resp = await axios.post(
        "https://api.openai.com/v1/audio/transcriptions",
        formData,
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            ...formData.getHeaders()
          }
        }
      );

      const transcript = resp.data.text;
      // Compare to expected text logic here
      const accuracy = calculateAccuracy("YOUR_EXPECTED_TEXT", transcript);

      socket.emit("transcription-result", { transcript, accuracy });
    } catch (err) {
      console.error("Transcription error:", err);
      socket.emit("error", "Batch transcription failed");
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

httpServer.listen(4000, () => {
  console.log("Audio batch server running on port 4000");
});

function calculateAccuracy(expected: string, actual: string): number {
  if (!expected) return 0;
  const setA = new Set(expected.toLowerCase().split(/\s+/));
  const setB = new Set(actual.toLowerCase().split(/\s+/));
  const intersectionSize = new Set([...setA].filter(x => setB.has(x))).size;
  const unionSize = new Set([...setA, ...setB]).size;
  return unionSize === 0 ? 0 : (intersectionSize / unionSize) * 100;
}
