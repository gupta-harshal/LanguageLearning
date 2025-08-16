"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const instrument_1 = require("./instrument");
const express_1 = __importDefault(require("express"));
const index_1 = __importDefault(require("./routes/index"));
const dotenv_1 = __importDefault(require("dotenv"));
const audiogen_1 = require("./apis/audiogen");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/v1', index_1.default);
app.get('/', (req, res) => {
    res.send('<h1>Welcome to Language Learning Backend API</h1>');
    setTimeout(() => {
        try {
            throw new Error("Test Sentry logging: deliberate exception");
        }
        catch (e) {
            if (e instanceof Error) {
                instrument_1.Sentry.captureException(e);
                instrument_1.Sentry.flush(2000).then(() => {
                    console.log("Sentry flushed the error:", e.message);
                });
            }
            else {
                instrument_1.Sentry.captureException(String(e));
                instrument_1.Sentry.flush(2000).then(() => {
                    console.log("Sentry flushed a non-error exception:", String(e));
                });
            }
        }
    }, 99);
});
app.use(instrument_1.Sentry.expressErrorHandler());
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
(0, audiogen_1.startAudioBatchServer)(4000);
