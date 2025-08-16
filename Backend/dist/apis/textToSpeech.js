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
exports.default = TTS;
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
function TTS(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { text } = req.body;
        try {
            const audio = yield openai.audio.speech.create({
                model: "gpt-4o-mini-tts",
                voice: "coral",
                input: text,
                response_format: "mp3",
            });
            res.setHeader("Content-Type", "audio/mpeg");
            res.setHeader("Content-Disposition", 'inline; filename="speech.mp3"');
            res.send(audio);
        }
        catch (error) {
            res.status(500).json({ error: error.message || "TTS Error" });
        }
    });
}
