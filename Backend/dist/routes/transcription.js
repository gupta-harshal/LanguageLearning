"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const textToSpeech_1 = __importDefault(require("../apis/textToSpeech"));
const transcriptionRouter = (0, express_1.Router)();
transcriptionRouter.post('TTS', textToSpeech_1.default);
exports.default = transcriptionRouter;
