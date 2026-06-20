"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const userRepository_1 = require("../repositories/userRepository");
const jwt_1 = require("../utils/jwt");
const response_1 = require("../utils/response");
const redis_1 = __importDefault(require("../config/redis"));
exports.authController = {
    async register(req, res) {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role)
            return (0, response_1.sendError)(res, 'Все поля обязательны');
        if (!['tenant', 'landlord'].includes(role))
            return (0, response_1.sendError)(res, 'Неверная роль');
        if (password.length < 8)
            return (0, response_1.sendError)(res, 'Пароль должен быть не менее 8 символов');
        const existing = await userRepository_1.userRepository.findByEmail(email);
        if (existing)
            return (0, response_1.sendError)(res, 'Email уже используется', 409);
        const user = await userRepository_1.userRepository.create(name, email, password, role);
        const token = (0, jwt_1.signToken)({ userId: user.id, role: user.role });
        const refreshToken = (0, jwt_1.signRefreshToken)({ userId: user.id });
        await redis_1.default.setEx(`refresh:${user.id}`, 7 * 24 * 3600, refreshToken);
        return (0, response_1.sendSuccess)(res, { user, token, refreshToken }, 201);
    },
    async login(req, res) {
        const { email, password } = req.body;
        if (!email || !password)
            return (0, response_1.sendError)(res, 'Email и пароль обязательны');
        const user = await userRepository_1.userRepository.findByEmail(email);
        if (!user)
            return (0, response_1.sendError)(res, 'Неверный email или пароль', 401);
        const valid = await userRepository_1.userRepository.comparePassword(password, user.password);
        if (!valid)
            return (0, response_1.sendError)(res, 'Неверный email или пароль', 401);
        delete user.password;
        const token = (0, jwt_1.signToken)({ userId: user.id, role: user.role });
        const refreshToken = (0, jwt_1.signRefreshToken)({ userId: user.id });
        await redis_1.default.setEx(`refresh:${user.id}`, 7 * 24 * 3600, refreshToken);
        return (0, response_1.sendSuccess)(res, { user, token, refreshToken });
    },
    async refresh(req, res) {
        const { refreshToken } = req.body;
        if (!refreshToken)
            return (0, response_1.sendError)(res, 'Refresh token required', 401);
        try {
            const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
            const stored = await redis_1.default.get(`refresh:${payload.userId}`);
            if (stored !== refreshToken)
                return (0, response_1.sendError)(res, 'Invalid refresh token', 401);
            const user = await userRepository_1.userRepository.findById(payload.userId);
            if (!user)
                return (0, response_1.sendError)(res, 'User not found', 401);
            const token = (0, jwt_1.signToken)({ userId: user.id, role: user.role });
            return (0, response_1.sendSuccess)(res, { token });
        }
        catch {
            return (0, response_1.sendError)(res, 'Invalid refresh token', 401);
        }
    },
    async logout(req, res) {
        if (req.userId)
            await redis_1.default.del(`refresh:${req.userId}`);
        return (0, response_1.sendSuccess)(res, null, 200, 'Logged out');
    },
    async getMe(req, res) {
        const user = await userRepository_1.userRepository.findById(req.userId);
        if (!user)
            return (0, response_1.sendError)(res, 'User not found', 404);
        return (0, response_1.sendSuccess)(res, user);
    },
    async updateProfile(req, res) {
        const { name, phone } = req.body;
        const avatar = req.file ? `/uploads/${req.file.filename}` : undefined;
        const updated = await userRepository_1.userRepository.update(req.userId, { ...(name && { name }), ...(phone && { phone }), ...(avatar && { avatar }) });
        return (0, response_1.sendSuccess)(res, updated);
    }
};
