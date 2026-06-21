import { reviewRepository } from '../repositories/reviewRepository'
import { AppError } from './authService'

export const reviewService = {
  async create(authorId: string, landlordId: string, rating: number, comment?: string, listingId?: string) {
    if (!landlordId) {
      throw new AppError('Не указан арендодатель')
    }
    if (!rating || rating < 1 || rating > 5) {
      throw new AppError('Оценка должна быть от 1 до 5')
    }
    // Бизнес-правило: нельзя оставить отзыв самому себе
    if (authorId === landlordId) {
      throw new AppError('Нельзя оставить отзыв самому себе')
    }
    // Бизнес-правило: один отзыв на одного арендодателя (в рамках объявления)
    const existing = await reviewRepository.findExisting(authorId, landlordId, listingId)
    if (existing) {
      throw new AppError('Вы уже оставили отзыв этому арендодателю', 409)
    }
    return reviewRepository.create(authorId, landlordId, rating, comment, listingId)
  },

  async getByLandlord(landlordId: string) {
    const reviews = await reviewRepository.findByLandlord(landlordId)
    const summary = await reviewRepository.getRatingSummary(landlordId)
    return { reviews, ...summary }
  },
}
