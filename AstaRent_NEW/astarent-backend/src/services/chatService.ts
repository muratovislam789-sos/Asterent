import { chatRepository } from '../repositories/chatRepository'
import { listingRepository } from '../repositories/listingRepository'
import { AppError } from './authService'

export const chatService = {
  async getChats(userId: string) {
    return chatRepository.findByUser(userId)
  },

  async getChat(chatId: string, userId: string) {
    const chat = await chatRepository.findById(chatId)
    if (!chat) {
      throw new AppError('Чат не найден', 404)
    }
    // Бизнес-правило: видеть чат могут только его участники
    if (chat.tenant.id !== userId && chat.landlord.id !== userId) {
      throw new AppError('Нет доступа', 403)
    }
    return chat
  },

  async startChat(listingId: string, userId: string) {
    if (!listingId) {
      throw new AppError('listingId required')
    }
    const listing = await listingRepository.findById(listingId)
    if (!listing) {
      throw new AppError('Объявление не найдено', 404)
    }
    // Бизнес-правило: нельзя начать чат с самим собой
    if (listing.landlord.id === userId) {
      throw new AppError('Нельзя начать чат с самим собой')
    }
    const chat = await chatRepository.findOrCreate(listingId, userId, listing.landlord.id)
    return chatRepository.findById(chat.id)
  },

  async getMessages(chatId: string, userId: string, page: number) {
    const chat = await chatRepository.findById(chatId)
    if (!chat) {
      throw new AppError('Чат не найден', 404)
    }
    if (chat.tenant.id !== userId && chat.landlord.id !== userId) {
      throw new AppError('Нет доступа', 403)
    }
    const messages = await chatRepository.getMessages(chatId, page)
    await chatRepository.markAsRead(chatId, userId)
    return messages
  },

  async sendMessage(chatId: string, userId: string, text: string) {
    if (!text?.trim()) {
      throw new AppError('Текст обязателен')
    }
    const chat = await chatRepository.findById(chatId)
    if (!chat) {
      throw new AppError('Чат не найден', 404)
    }
    if (chat.tenant.id !== userId && chat.landlord.id !== userId) {
      throw new AppError('Нет доступа', 403)
    }
    return chatRepository.saveMessage(chatId, userId, text.trim())
  },
}
