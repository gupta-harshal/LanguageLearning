"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GrammarEngine_1 = __importDefault(require("../apis/GrammarEngine"));
const authentication_1 = require("../middlewares/authentication");
const checkRouter = (0, express_1.Router)();
checkRouter.post('/check', authentication_1.authenticate, GrammarEngine_1.default);
exports.default = checkRouter;
