"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAudioBatchServer = startAudioBatchServer;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = require("os");
const util_1 = require("util");
const openai_1 = __importDefault(require("openai"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const writeFileAsync = (0, util_1.promisify)(fs_1.default.writeFile);
const unlinkAsync = (0, util_1.promisify)(fs_1.default.unlink);
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY || "" });
function calculateAccuracy(expected, actual) {
    if (!expected)
        return 0;
    const setA = new Set(expected.toLowerCase().split(/\s+/));
    const setB = new Set(actual.toLowerCase().split(/\s+/));
    const intersection = [...setA].filter((x) => setB.has(x)).length;
    const union = new Set([...setA, ...setB]).size;
    return union ? (intersection / union) * 100 : 0;
}
function reencodeAudio(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        (0, fluent_ffmpeg_1.default)(inputPath)
            .noVideo()
            .audioCodec("libopus")
            .format("webm")
            .on("end", () => resolve())
            .on("error", (err) => reject(err))
            .save(outputPath);
    });
}
function logAudioFormat(filePath) {
    return new Promise((resolve) => {
        fluent_ffmpeg_1.default.ffprobe(filePath, (err, metadata) => {
            var _a;
            if (err) {
                console.warn(`⚠️ ffprobe error for ${path_1.default.basename(filePath)}:`, err.message);
                resolve(false);
                return;
            }
            console.log(`\n🔍 ffprobe info for ${path_1.default.basename(filePath)}:`, metadata.format);
            (_a = metadata.streams) === null || _a === void 0 ? void 0 : _a.forEach((s, i) => console.log(`📻 Stream ${i}:`, {
                codec: s.codec_name,
                sample_rate: s.sample_rate,
                channels: s.channels,
                duration: s.duration,
            }));
            resolve(true);
        });
    });
}
function startAudioBatchServer(port) {
    const app = (0, express_1.default)();
    const httpServer = (0, http_1.createServer)(app);
    const io = new socket_io_1.Server(httpServer, { cors: { origin: "*" } });
    io.on("connection", (socket) => {
        console.log(`✅ Client connected: ${socket.id}`);
        socket.on("audio-batch", (audioBuffer) => __awaiter(this, void 0, void 0, function* () {
            console.log(`\n🎤 Received audio batch from ${socket.id}`);
            console.log(`📦 Size: ${audioBuffer.byteLength} bytes`);
            const buffer = Buffer.from(audioBuffer);
            const rawPath = path_1.default.join((0, os_1.tmpdir)(), `raw-${Date.now()}.webm`);
            const convertedPath = path_1.default.join((0, os_1.tmpdir)(), `conv-${Date.now()}.webm`);
            try {
                yield writeFileAsync(rawPath, buffer);
                console.log(`💾 Saved raw batch to ${rawPath}`);
                // Check validity
                const isValidRaw = yield logAudioFormat(rawPath);
                if (!isValidRaw) {
                    console.warn("⏩ Skipping invalid batch");
                    return;
                }
                console.log("♻️ Re-encoding...");
                yield reencodeAudio(rawPath, convertedPath);
                const isValidConv = yield logAudioFormat(convertedPath);
                if (!isValidConv) {
                    console.warn("⏩ Skipping invalid converted batch");
                    return;
                }
                console.log("📡 Sending to Whisper...");
                const transcription = yield openai.audio.transcriptions.create({
                    file: fs_1.default.createReadStream(convertedPath),
                    model: "whisper-1",
                });
                const transcript = transcription.text;
                console.log("📝 Transcript:", transcript);
                const accuracy = calculateAccuracy("こんにちは、私の名前はハーシャル・グプタです。元気です。", transcript);
                console.log(`📊 Accuracy: ${accuracy.toFixed(2)}%`);
                socket.emit("transcription-result", { transcript, accuracy });
            }
            catch (err) {
                console.error("❌ Processing error:", err);
            }
            finally {
                for (const f of [rawPath, convertedPath]) {
                    if (fs_1.default.existsSync(f))
                        yield unlinkAsync(f);
                }
            }
        }));
        socket.on("disconnect", () => console.log(`❌ Client disconnected: ${socket.id}`));
    });
    httpServer.listen(port, () => console.log(`🚀 Audio batch server running on port ${port}`));
}
