import { Response } from 'express'
import { listingRepository } from '../repositories/listingRepository'
import { sendSuccess, sendError } from '../utils/response'
import { AuthRequest } from '../middleware/auth'

export const listingController = {
  async getAll(req: AuthRequest, res: Response) {
    const result = await listingRepository.findAll(req.query, req.userId)
    return sendSuccess(res, result)
  },

  async getById(req: AuthRequest, res: Response) {
    const listing = await listingRepository.findById(req.params.id, req.userId)
    if (!listing) return sendError(res, 'Объявление не найдено', 404)
    return sendSuccess(res, listing)
  },

  async getMyListings(req: AuthRequest, res: Response) {
    const listings = await listingRepository.findByLandlord(req.userId!)
    return sendSuccess(res, listings)
  },

  async create(req: AuthRequest, res: Response) {
    const files = (req as any).files as Express.Multer.File[] || []
    const photos = files.map(f => `/uploads/${f.filename}`)
    if (!req.body.title || !req.body.price || !req.body.district || !req.body.address || !req.body.area) {
      return sendError(res, 'Заполните все обязательные поля')
    }
    const listing = await listingRepository.create(req.userId!, req.body, photos)
    return sendSuccess(res, listing, 201)
  },

  async update(req: AuthRequest, res: Response) {
    const existing = await listingRepository.findById(req.params.id)
    if (!existing) return sendError(res, 'Объявление не найдено', 404)
    if (existing.landlord.id !== req.userId) return sendError(res, 'Нет прав на редактирование', 403)
    const files = (req as any).files as Express.Multer.File[] || []
    const newPhotos = files.map(f => `/uploads/${f.filename}`)
    const listing = await listingRepository.update(req.params.id, req.body, newPhotos.length > 0 ? newPhotos : undefined)
    return sendSuccess(res, listing)
  },

  async delete(req: AuthRequest, res: Response) {
    const existing = await listingRepository.findById(req.params.id)
    if (!existing) return sendError(res, 'Объявление не найдено', 404)
    if (existing.landlord.id !== req.userId) return sendError(res, 'Нет прав на удаление', 403)
    await listingRepository.delete(req.params.id)
    return sendSuccess(res, null, 200, 'Удалено')
  },

  async getFavorites(req: AuthRequest, res: Response) {
    const listings = await listingRepository.findFavorites(req.userId!)
    return sendSuccess(res, listings)
  },

  async toggleFavorite(req: AuthRequest, res: Response) {
    const isFavorited = await listingRepository.toggleFavorite(req.userId!, req.params.id)
    return sendSuccess(res, { isFavorited })
  }
}
