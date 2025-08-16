"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const check_1 = __importDefault(require("./check"));
const transcription_1 = __importDefault(require("./transcription"));
const router = (0, express_1.Router)();
router.use('/users', auth_1.default);
router.use('/', check_1.default);
router.use('/audio&textcomms', transcription_1.default);
router.use('/audio', transcription_1.default);
exports.default = router;
