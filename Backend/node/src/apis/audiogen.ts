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

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

function calculateAccuracy(expected: string, actual: string): number {
  if (!expected) return 0;
  const setA = new Set(expected.toLowerCase().split(/\s+/));
  const setB = new Set(actual.toLowerCase().split(/\s+/));
  const intersection = [...setA].filter((x) => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union ? (intersection / union) * 100 : 0;
}

function reencodeAudio(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .noVideo()
      .audioCodec("libopus")
      .format("webm")
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .save(outputPath);
  });
}

function logAudioFormat(filePath: string): Promise<boolean> {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(filePath, (err: Error | null, metadata: ffmpeg.FfprobeData) => {
      if (err) {
        console.warn(`⚠️ ffprobe error for ${path.basename(filePath)}:`, err.message);
        resolve(false);
        return;
      }
      console.log(`\n🔍 ffprobe info for ${path.basename(filePath)}:`, metadata.format);
      metadata.streams?.forEach((s, i) =>
        console.log(`📻 Stream ${i}:`, {
          codec: s.codec_name,
          sample_rate: s.sample_rate,
          channels: s.channels,
          duration: s.duration,
        })
      );
      resolve(true);
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
      console.log(`📦 Size: ${audioBuffer.byteLength} bytes`);

      const buffer = Buffer.from(audioBuffer);
      const rawPath = path.join(tmpdir(), `raw-${Date.now()}.webm`);
      const convertedPath = path.join(tmpdir(), `conv-${Date.now()}.webm`);

      try {
        await writeFileAsync(rawPath, buffer);
        console.log(`💾 Saved raw batch to ${rawPath}`);

        // Check validity
        const isValidRaw = await logAudioFormat(rawPath);
        if (!isValidRaw) {
          console.warn("⏩ Skipping invalid batch");
          return;
        }

        console.log("♻️ Re-encoding...");
        await reencodeAudio(rawPath, convertedPath);
        const isValidConv = await logAudioFormat(convertedPath);
        if (!isValidConv) {
          console.warn("⏩ Skipping invalid converted batch");
          return;
        }

        console.log("📡 Sending to Whisper...");
        const transcription = await openai.audio.transcriptions.create({
          file: fs.createReadStream(convertedPath),
          model: "whisper-1",
        });

        const transcript = transcription.text;
        console.log("📝 Transcript:", transcript);

        const accuracy = calculateAccuracy(
          "こんにちは、私の名前はハーシャル・グプタです。元気です。",
          transcript
        );
        console.log(`📊 Accuracy: ${accuracy.toFixed(2)}%`);

        socket.emit("transcription-result", { transcript, accuracy });
      } catch (err) {
        console.error("❌ Processing error:", err);
      } finally {
        for (const f of [rawPath, convertedPath]) {
          if (fs.existsSync(f)) await unlinkAsync(f);
        }
      }
    });

    socket.on("disconnect", () =>
      console.log(`❌ Client disconnected: ${socket.id}`)
    );
  });

  httpServer.listen(port, () =>
    console.log(`🚀 Audio batch server running on port ${port}`)
  );
}
