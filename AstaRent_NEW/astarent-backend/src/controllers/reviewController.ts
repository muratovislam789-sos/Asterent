import { Response } from 'express'
import { reviewService } from '../services/reviewService'
import { AppError } from '../services/authService'
import { sendSuccess, sendError } from '../utils/response'

export const reviewController = {
  async create(req: any, res: Response) {
    try {
      const { landlordId, rating, comment, listingId } = req.body
      const review = await reviewService.create(req.userId, landlordId, Number(rating), comment, listingId)
      return sendSuccess(res, review, 201)
    } catch (err) {
      if (err instanceof AppError) return sendError(res, err.message, err.statusCode)
      console.error(err)
      return sendError(res, 'Внутренняя ошибка сервера', 500)
    }
  },

  async getByLandlord(req: any, res: Response) {
    try {
      const result = await reviewService.getByLandlord(req.params.landlordId)
      return sendSuccess(res, result)
    } catch (err) {
      console.error(err)
      return sendError(res, 'Внутренняя ошибка сервера', 500)
    }
  },
}
