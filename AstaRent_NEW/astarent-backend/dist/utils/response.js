"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data, statusCode = 200, message) => res.status(statusCode).json({ success: true, data, ...(message && { message }) });
exports.sendSuccess = sendSuccess;
const sendError = (res, error, statusCode = 400) => res.status(statusCode).json({ success: false, error });
exports.sendError = sendError;
