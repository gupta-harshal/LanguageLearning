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
exports.default = grammarEngine;
const axios_1 = __importDefault(require("axios"));
function grammarEngine(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { text } = req.body;
            if (!text) {
                return res.status(400).json({ error: "Text is required" });
            }
            const params = new URLSearchParams();
            params.append("text", text);
            params.append("language", "ja");
            const result = yield axios_1.default.post('https://api.languagetool.org/v2/check', params.toString(), {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });
            res.json(result.data.matches);
        }
        catch (error) {
            console.error("Error in grammarEngine:", error.message || error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });
}
