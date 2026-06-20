"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const response_1 = require("../utils/response");
const authenticate = (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer '))
        return (0, response_1.sendError)(res, 'Необходима авторизация', 401);
    try {
        const payload = (0, jwt_1.verifyToken)(auth.slice(7));
        req.userId = payload.userId;
        req.userRole = payload.role;
        next();
    }
    catch {
        return (0, response_1.sendError)(res, 'Токен недействителен или истёк', 401);
    }
};
exports.authenticate = authenticate;
const requireRole = (role) => (req, res, next) => {
    if (req.userRole !== role)
        return (0, response_1.sendError)(res, 'Недостаточно прав', 403);
    next();
};
exports.requireRole = requireRole;
