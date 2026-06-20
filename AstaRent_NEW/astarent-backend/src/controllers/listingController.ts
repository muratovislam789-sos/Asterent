import { Response } from 'express'
import { listingService } from '../services/listingService'
import { AppError } from '../services/authService'
import { sendSuccess, sendError } from '../utils/response'

export const listingController = {
  async getAll(req: any, res: Response) {
    try {
      const result = await listingService.getAll(req.query, req.userId)
      return sendSuccess(res, result)
    } catch (err) {
      console.error(err)
      return sendError(res, 'Внутренняя ошибка сервера', 500)
    }
  },

  async getById(req: any, res: Response) {
    try {
      const listing = await listingService.getById(req.params.id, req.userId)
      return sendSuccess(res, listing)
    } catch (err) {
      if (err instanceof AppError) return sendError(res, err.message, err.statusCode)
      console.error(err)
      return sendError(res, 'Внутренняя ошибка сервера', 500)
    }
  },

  async getMyListings(req: any, res: Response) {
    try {
      const listings = await listingService.getMyListings(req.userId)
      return sendSuccess(res, listings)
    } catch (err) {
      console.error(err)
      return sendError(res, 'Внутренняя ошибка сервера', 500)
    }
  },

  async create(req: any, res: Response) {
    try {
      const files = (req.files || []) as any[]
      const photos = files.map((f: any) => f.path)
      const listing = await listingService.create(req.userId, req.body, photos)
      return sendSuccess(res, listing, 201)
    } catch (err) {
      if (err instanceof AppError) return sendError(res, err.message, err.statusCode)
      console.error(err)
      return sendError(res, 'Внутренняя ошибка сервера', 500)
    }
  },

  async update(req: any, res: Response) {
    try {
      const files = (req.files || []) as any[]
      const newPhotos = files.map((f: any) => f.path)
      const listing = await listingService.update(
        req.params.id,
        req.userId,
        req.body,
        newPhotos.length > 0 ? newPhotos : undefined
      )
      return sendSuccess(res, listing)
    } catch (err) {
      if (err instanceof AppError) return sendError(res, err.message, err.statusCode)
      console.error(err)
      return sendError(res, 'Внутренняя ошибка сервера', 500)
    }
  },

  async delete(req: any, res: Response) {
    try {
      await listingService.delete(req.params.id, req.userId)
      return sendSuccess(res, null, 200, 'Удалено')
    } catch (err) {
      if (err instanceof AppError) return sendError(res, err.message, err.statusCode)
      console.error(err)
      return sendError(res, 'Внутренняя ошибка сервера', 500)
    }
  },

  async getFavorites(req: any, res: Response) {
    try {
      const listings = await listingService.getFavorites(req.userId)
      return sendSuccess(res, listings)
    } catch (err) {
      console.error(err)
      return sendError(res, 'Внутренняя ошибка сервера', 500)
    }
  },

  async toggleFavorite(req: any, res: Response) {
    try {
      const isFavorited = await listingService.toggleFavorite(req.userId, req.params.id)
      return sendSuccess(res, { isFavorited })
    } catch (err) {
      console.error(err)
      return sendError(res, 'Внутренняя ошибка сервера', 500)
    }
  },
}
