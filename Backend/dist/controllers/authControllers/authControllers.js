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
exports.logoutOthers = exports.sessions = exports.logout = exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const jwt_1 = require("../../utils/jwt");
const redis_1 = require("../../utils/redis");
const prisma = new client_1.PrismaClient();
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
    const user = yield prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });
    const { token, jti } = (0, jwt_1.generateToken)(user.id);
    yield redis_1.redis.set(`session:${user.id}:${jti}`, JSON.stringify({ createdAt: new Date().toISOString(), deviceUserAgent: req.headers['user-agent'] || 'unknown',
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown' }));
    res.json({ token });
});
exports.signup = signup;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield prisma.user.findUnique({ where: { email } });
    if (!user || !(yield bcryptjs_1.default.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const { token, jti } = (0, jwt_1.generateToken)(user.id);
    yield redis_1.redis.set(`session:${user.id}:${jti}`, JSON.stringify({ createdAt: new Date().toISOString() }));
    res.json({ token });
});
exports.login = login;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token)
        return res.status(400).json({ message: 'No token provided' });
    const { userId, jti } = (0, jwt_1.verifyToken)(token);
    yield redis_1.redis.del(`session:${userId}:${jti}`);
    res.json({ message: 'Logged out' });
});
exports.logout = logout;
const sessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const keys = yield redis_1.redis.keys(`session:${userId}:*`);
    const allSessions = yield Promise.all(keys.map(key => redis_1.redis.get(key)));
    res.json({ sessions: allSessions });
});
exports.sessions = sessions;
const logoutOthers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token)
        return res.status(400).json({ message: 'No token provided' });
    const { userId, jti: currentJti } = (0, jwt_1.verifyToken)(token);
    const keys = yield redis_1.redis.keys(`session:${userId}:*`);
    const otherSessions = keys.filter(key => !key.endsWith(currentJti));
    yield Promise.all(otherSessions.map(key => redis_1.redis.del(key)));
    res.json({ message: 'Other sessions logged out' });
});
exports.logoutOthers = logoutOthers;
