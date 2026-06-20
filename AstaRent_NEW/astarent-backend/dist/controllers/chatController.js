"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatController = void 0;
const chatRepository_1 = require("../repositories/chatRepository");
const listingRepository_1 = require("../repositories/listingRepository");
const response_1 = require("../utils/response");
exports.chatController = {
    async getChats(req, res) {
        const chats = await chatRepository_1.chatRepository.findByUser(req.userId);
        return (0, response_1.sendSuccess)(res, chats);
    },
    async getChat(req, res) {
        const chat = await chatRepository_1.chatRepository.findById(req.params.id);
        if (!chat)
            return (0, response_1.sendError)(res, 'Чат не найден', 404);
        if (chat.tenant.id !== req.userId && chat.landlord.id !== req.userId)
            return (0, response_1.sendError)(res, 'Нет доступа', 403);
        return (0, response_1.sendSuccess)(res, chat);
    },
    async startChat(req, res) {
        const { listingId } = req.body;
        if (!listingId)
            return (0, response_1.sendError)(res, 'listingId required');
        const listing = await listingRepository_1.listingRepository.findById(listingId);
        if (!listing)
            return (0, response_1.sendError)(res, 'Объявление не найдено', 404);
        if (listing.landlord.id === req.userId)
            return (0, response_1.sendError)(res, 'Нельзя начать чат с самим собой', 400);
        const chat = await chatRepository_1.chatRepository.findOrCreate(listingId, req.userId, listing.landlord.id);
        const full = await chatRepository_1.chatRepository.findById(chat.id);
        return (0, response_1.sendSuccess)(res, full, 201);
    },
    async getMessages(req, res) {
        const chat = await chatRepository_1.chatRepository.findById(req.params.id);
        if (!chat)
            return (0, response_1.sendError)(res, 'Чат не найден', 404);
        if (chat.tenant.id !== req.userId && chat.landlord.id !== req.userId)
            return (0, response_1.sendError)(res, 'Нет доступа', 403);
        const page = Number(req.query.page) || 1;
        const messages = await chatRepository_1.chatRepository.getMessages(req.params.id, page);
        await chatRepository_1.chatRepository.markAsRead(req.params.id, req.userId);
        return (0, response_1.sendSuccess)(res, messages);
    },
    async sendMessage(req, res) {
        const { text } = req.body;
        if (!text?.trim())
            return (0, response_1.sendError)(res, 'Текст обязателен');
        const chat = await chatRepository_1.chatRepository.findById(req.params.id);
        if (!chat)
            return (0, response_1.sendError)(res, 'Чат не найден', 404);
        if (chat.tenant.id !== req.userId && chat.landlord.id !== req.userId)
            return (0, response_1.sendError)(res, 'Нет доступа', 403);
        const message = await chatRepository_1.chatRepository.saveMessage(req.params.id, req.userId, text.trim());
        return (0, response_1.sendSuccess)(res, message, 201);
    }
};
