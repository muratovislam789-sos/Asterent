import { listingRepository } from '../repositories/listingRepository'
import { viewHistoryService } from './viewHistoryService'
import { ListingFilters } from '../models/Listing'
import { AppError } from './authService'

export const listingService = {
  async getAll(filters: ListingFilters, userId?: string) {
    return listingRepository.findAll(filters, userId)
  },

  async getById(id: string, userId?: string) {
    const listing = await listingRepository.findById(id, userId)
    if (!listing) {
      throw new AppError('Объявление не найдено', 404)
    }
    // Записываем в историю просмотров, только если пользователь авторизован
    if (userId) {
      await viewHistoryService.recordView(userId, id)
    }
    return listing
  },

  async getMyListings(landlordId: string) {
    return listingRepository.findByLandlord(landlordId)
  },

  async create(landlordId: string, dto: any, photos: string[]) {
    if (!dto.title || !dto.price || !dto.district || !dto.address || !dto.area) {
      throw new AppError('Заполните все обязательные поля')
    }
    return listingRepository.create(landlordId, dto, photos)
  },

  async update(listingId: string, userId: string, dto: any, newPhotos?: string[]) {
    const existing = await listingRepository.findById(listingId)
    if (!existing) {
      throw new AppError('Объявление не найдено', 404)
    }
    if (existing.landlord.id !== userId) {
      throw new AppError('Нет прав на редактирование', 403)
    }
    return listingRepository.update(listingId, dto, newPhotos)
  },

  async delete(listingId: string, userId: string) {
    const existing = await listingRepository.findById(listingId)
    if (!existing) {
      throw new AppError('Объявление не найдено', 404)
    }
    if (existing.landlord.id !== userId) {
      throw new AppError('Нет прав на удаление', 403)
    }
    await listingRepository.delete(listingId)
  },

  async getFavorites(userId: string) {
    return listingRepository.findFavorites(userId)
  },

  async toggleFavorite(userId: string, listingId: string) {
    return listingRepository.toggleFavorite(userId, listingId)
  },
}
