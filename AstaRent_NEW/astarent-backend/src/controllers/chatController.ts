import { Response } from 'express'
import { chatRepository } from '../repositories/chatRepository'
import { listingRepository } from '../repositories/listingRepository'
import { sendSuccess, sendError } from '../utils/response'
import { AuthRequest } from '../middleware/auth'

export const chatController = {
  async getChats(req: AuthRequest, res: Response) {
    const chats = await chatRepository.findByUser(req.userId!)
    return sendSuccess(res, chats)
  },

  async getChat(req: AuthRequest, res: Response) {
    const chat = await chatRepository.findById(req.params.id)
    if (!chat) return sendError(res, 'Чат не найден', 404)
    if (chat.tenant.id !== req.userId && chat.landlord.id !== req.userId) return sendError(res, 'Нет доступа', 403)
    return sendSuccess(res, chat)
  },

  async startChat(req: AuthRequest, res: Response) {
    const { listingId } = req.body
    if (!listingId) return sendError(res, 'listingId required')
    const listing = await listingRepository.findById(listingId)
    if (!listing) return sendError(res, 'Объявление не найдено', 404)
    if (listing.landlord.id === req.userId) return sendError(res, 'Нельзя начать чат с самим собой', 400)
    const chat = await chatRepository.findOrCreate(listingId, req.userId!, listing.landlord.id)
    const full = await chatRepository.findById(chat.id)
    return sendSuccess(res, full, 201)
  },

  async getMessages(req: AuthRequest, res: Response) {
    const chat = await chatRepository.findById(req.params.id)
    if (!chat) return sendError(res, 'Чат не найден', 404)
    if (chat.tenant.id !== req.userId && chat.landlord.id !== req.userId) return sendError(res, 'Нет доступа', 403)
    const page = Number(req.query.page) || 1
    const messages = await chatRepository.getMessages(req.params.id, page)
    await chatRepository.markAsRead(req.params.id, req.userId!)
    return sendSuccess(res, messages)
  },

  async sendMessage(req: AuthRequest, res: Response) {
    const { text } = req.body
    if (!text?.trim()) return sendError(res, 'Текст обязателен')
    const chat = await chatRepository.findById(req.params.id)
    if (!chat) return sendError(res, 'Чат не найден', 404)
    if (chat.tenant.id !== req.userId && chat.landlord.id !== req.userId) return sendError(res, 'Нет доступа', 403)
    const message = await chatRepository.saveMessage(req.params.id, req.userId!, text.trim())
    return sendSuccess(res, message, 201)
  }
}
