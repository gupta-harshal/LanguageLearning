"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const redis_1 = require("@upstash/redis");
exports.redis = new redis_1.Redis({
    url: 'https://whole-skylark-6474.upstash.io',
    token: process.env.REDIS_TOKEN,
});
