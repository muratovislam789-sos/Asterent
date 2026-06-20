"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyToken = exports.signRefreshToken = exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_in_production';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
const signToken = (payload) => jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: (process.env.JWT_EXPIRES_IN || '15m') });
exports.signToken = signToken;
const signRefreshToken = (payload) => jsonwebtoken_1.default.sign(payload, REFRESH_SECRET, { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') });
exports.signRefreshToken = signRefreshToken;
const verifyToken = (token) => jsonwebtoken_1.default.verify(token, JWT_SECRET);
exports.verifyToken = verifyToken;
const verifyRefreshToken = (token) => jsonwebtoken_1.default.verify(token, REFRESH_SECRET);
exports.verifyRefreshToken = verifyRefreshToken;
