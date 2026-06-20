"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const database_1 = __importDefault(require("./config/database"));
const redis_1 = require("./config/redis");
const jwt_1 = require("./utils/jwt");
const chatRepository_1 = require("./repositories/chatRepository");
const auth_1 = __importDefault(require("./routes/auth"));
const listings_1 = __importDefault(require("./routes/listings"));
const chats_1 = __importDefault(require("./routes/chats"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: FRONTEND_URL, methods: ['GET', 'POST'], credentials: true },
});
app.use((0, cors_1.default)({ origin: FRONTEND_URL, credentials: true }));
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
app.use('/api/auth', auth_1.default);
app.use('/api/listings', listings_1.default);
app.use('/api/chats', chats_1.default);
app.get('/api/health', async (_, res) => {
    try {
        await database_1.default.query('SELECT 1');
        res.json({ success: true, status: 'healthy' });
    }
    catch {
        res.status(503).json({ success: false, status: 'unhealthy' });
    }
});
app.use((_, res) => res.status(404).json({ success: false, error: 'Not found' }));
app.use((err, _, res, __) => {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal server error' });
});
// WebSocket
io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token)
        return next(new Error('Auth required'));
    try {
        const payload = (0, jwt_1.verifyToken)(token);
        socket.data.userId = payload.userId;
        socket.data.role = payload.role;
        next();
    }
    catch {
        next(new Error('Invalid token'));
    }
});
io.on('connection', (socket) => {
    const userId = socket.data.userId;
    socket.join(`user:${userId}`);
    socket.on('join_chat', ({ chatId }) => {
        socket.join(`chat:${chatId}`);
    });
    socket.on('send_message', async ({ chatId, text }) => {
        try {
            const chat = await chatRepository_1.chatRepository.findById(chatId);
            if (!chat)
                return;
            if (chat.tenant.id !== userId && chat.landlord.id !== userId)
                return;
            const message = await chatRepository_1.chatRepository.saveMessage(chatId, userId, text.trim());
            socket.to(`chat:${chatId}`).emit('new_message', message);
            socket.emit('message_sent', message);
            const otherId = chat.tenant.id === userId ? chat.landlord.id : chat.tenant.id;
            io.to(`user:${otherId}`).emit('new_message', message);
        }
        catch (err) {
            console.error('Message error:', err);
        }
    });
    socket.on('mark_read', async ({ chatId }) => {
        try {
            await chatRepository_1.chatRepository.markAsRead(chatId, userId);
        }
        catch { }
    });
});
const PORT = Number(process.env.PORT) || 5000;
const start = async () => {
    try {
        await database_1.default.query('SELECT 1');
        await (0, redis_1.connectRedis)();
        httpServer.listen(PORT, () => {
            console.log(`AstaRent server running on port ${PORT}`);
        });
    }
    catch (err) {
        console.error('Failed to start:', err);
        process.exit(1);
    }
};
start();
