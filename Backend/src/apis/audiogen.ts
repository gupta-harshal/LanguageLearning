import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import fs from "fs";
import path from "path";
import { tmpdir } from "os";
import { promisify } from "util";
import OpenAI from "openai";
import ffmpeg from "fluent-ffmpeg";

const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
if (!OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY not set in environment variables");
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

function calculateAccuracy(expected: string, actual: string): number {
  if (!expected) return 0;
  const setA = new Set(expected.toLowerCase().split(/\s+/));
  const setB = new Set(actual.toLowerCase().split(/\s+/));
  const intersectionSize = new Set([...setA].filter((x) => setB.has(x))).size;
  const unionSize = new Set([...setA, ...setB]).size;
  return unionSize === 0 ? 0 : (intersectionSize / unionSize) * 100;
}

async function reencodeAudio(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .noVideo()
      .audioCodec("libopus")
      .format("webm")
      .on("end", resolve)
      .on("error", reject)
      .save(outputPath);
  });
}

async function logAudioFormat(filePath: string): Promise<void> {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(filePath, (err: Error | null, metadata: ffmpeg.FfprobeData) => {
      if (err) {
        console.warn(`⚠️ ffprobe error for ${path.basename(filePath)}:`, err.message);
        return resolve();
      }
      console.log(`\n🔍 ffprobe info for ${path.basename(filePath)}:`);
      console.log(JSON.stringify(metadata.format, null, 2));
      metadata.streams?.forEach((s, i) => {
        console.log(`📻 Stream ${i}:`, {
          codec_name: s.codec_name,
          codec_type: s.codec_type,
          sample_rate: s.sample_rate,
          channels: s.channels,
          bit_rate: s.bit_rate,
          duration: s.duration,
        });
      });
      resolve();
    });
  });
}

export function startAudioBatchServer(port: number) {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, { cors: { origin: "*" } });

  io.on("connection", (socket: Socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    socket.on("audio-batch", async (audioBuffer: ArrayBuffer) => {
      console.log(`\n🎤 Received audio batch from ${socket.id}`);
      console.log(`📦 Buffer size: ${audioBuffer.byteLength} bytes`);

      const buffer = Buffer.from(audioBuffer);
      const tempRaw = path.join(tmpdir(), `raw-${Date.now()}.webm`);
      const tempOut = path.join(tmpdir(), `converted-${Date.now()}.webm`);

      try {
        await writeFileAsync(tempRaw, buffer);
        console.log(`💾 Saved raw audio batch to ${tempRaw}`);

        await logAudioFormat(tempRaw);

        console.log("♻️ Re-encoding audio to clean WebM...");
        await reencodeAudio(tempRaw, tempOut);
        console.log(`✅ Re-encoded audio saved to ${tempOut}`);

        await logAudioFormat(tempOut);

        console.log("📡 Sending audio to OpenAI Whisper API...");
        const transcription = await openai.audio.transcriptions.create({
          file: fs.createReadStream(tempOut),
          model: "whisper-1",
        });

        const transcript = transcription.text;
        console.log("📝 Backend transcription result:", transcript);

        const accuracy = calculateAccuracy(
          "こんにちは、私の名前はハーシャル・グプタです。元気です。",
          transcript
        );
        console.log(`📊 Accuracy: ${accuracy.toFixed(2)}%`);

        socket.emit("transcription-result", { transcript, accuracy });
      } catch (err) {
        console.error("❌ Transcription error:", err);
        socket.emit("error", "Batch transcription failed");
      } finally {
        for (const file of [tempRaw, tempOut]) {
          if (fs.existsSync(file)) {
            await unlinkAsync(file).catch(() =>
              console.warn(`⚠️ Could not delete temp file: ${file}`)
            );
          }
        }
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`🚀 Audio batch server running on port ${port}`);
  });
}
