"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listingController = void 0;
const listingRepository_1 = require("../repositories/listingRepository");
const response_1 = require("../utils/response");
exports.listingController = {
    async getAll(req, res) {
        const result = await listingRepository_1.listingRepository.findAll(req.query, req.userId);
        return (0, response_1.sendSuccess)(res, result);
    },
    async getById(req, res) {
        const listing = await listingRepository_1.listingRepository.findById(req.params.id, req.userId);
        if (!listing)
            return (0, response_1.sendError)(res, 'Объявление не найдено', 404);
        return (0, response_1.sendSuccess)(res, listing);
    },
    async getMyListings(req, res) {
        const listings = await listingRepository_1.listingRepository.findByLandlord(req.userId);
        return (0, response_1.sendSuccess)(res, listings);
    },
    async create(req, res) {
        const files = req.files || [];
        const photos = files.map(f => `/uploads/${f.filename}`);
        if (!req.body.title || !req.body.price || !req.body.district || !req.body.address || !req.body.area) {
            return (0, response_1.sendError)(res, 'Заполните все обязательные поля');
        }
        const listing = await listingRepository_1.listingRepository.create(req.userId, req.body, photos);
        return (0, response_1.sendSuccess)(res, listing, 201);
    },
    async update(req, res) {
        const existing = await listingRepository_1.listingRepository.findById(req.params.id);
        if (!existing)
            return (0, response_1.sendError)(res, 'Объявление не найдено', 404);
        if (existing.landlord.id !== req.userId)
            return (0, response_1.sendError)(res, 'Нет прав на редактирование', 403);
        const files = req.files || [];
        const newPhotos = files.map(f => `/uploads/${f.filename}`);
        const listing = await listingRepository_1.listingRepository.update(req.params.id, req.body, newPhotos.length > 0 ? newPhotos : undefined);
        return (0, response_1.sendSuccess)(res, listing);
    },
    async delete(req, res) {
        const existing = await listingRepository_1.listingRepository.findById(req.params.id);
        if (!existing)
            return (0, response_1.sendError)(res, 'Объявление не найдено', 404);
        if (existing.landlord.id !== req.userId)
            return (0, response_1.sendError)(res, 'Нет прав на удаление', 403);
        await listingRepository_1.listingRepository.delete(req.params.id);
        return (0, response_1.sendSuccess)(res, null, 200, 'Удалено');
    },
    async getFavorites(req, res) {
        const listings = await listingRepository_1.listingRepository.findFavorites(req.userId);
        return (0, response_1.sendSuccess)(res, listings);
    },
    async toggleFavorite(req, res) {
        const isFavorited = await listingRepository_1.listingRepository.toggleFavorite(req.userId, req.params.id);
        return (0, response_1.sendSuccess)(res, { isFavorited });
    }
};
