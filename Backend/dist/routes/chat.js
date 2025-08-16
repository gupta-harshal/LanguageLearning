"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatRouter = express_1.default.Router();
chatRouter.get("/joinRoom/:id");
chatRouter.get("/joinRoom/random");
exports.default = chatRouter;
