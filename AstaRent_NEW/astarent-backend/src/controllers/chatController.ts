import { Response } from 'express'
import { chatService } from '../services/chatService'
import { AppError } from '../services/authService'
import { sendSuccess, sendError } from '../utils/response'

export const chatController = {
  async getChats(req: any, res: Response) {
    try {
      const chats = await chatService.getChats(req.userId)
      return sendSuccess(res, chats)
    } catch (err) {
      console.error(err)
      return sendError(res, 'Внутренняя ошибка сервера', 500)
    }
  },

  async getChat(req: any, res: Response) {
    try {
      const chat = await chatService.getChat(req.params.id, req.userId)
      return sendSuccess(res, chat)
    } catch (err) {
      if (err instanceof AppError) return sendError(res, err.message, err.statusCode)
      console.error(err)
      return sendError(res, 'Внутренняя ошибка сервера', 500)
    }
  },

  async startChat(req: any, res: Response) {
    try {
      const chat = await chatService.startChat(req.body.listingId, req.userId)
      return sendSuccess(res, chat, 201)
    } catch (err) {
      if (err instanceof AppError) return sendError(res, err.message, err.statusCode)
      console.error(err)
      return sendError(res, 'Внутренняя ошибка сервера', 500)
    }
  },

  async getMessages(req: any, res: Response) {
    try {
      const page = Number(req.query.page) || 1
      const messages = await chatService.getMessages(req.params.id, req.userId, page)
      return sendSuccess(res, messages)
    } catch (err) {
      if (err instanceof AppError) return sendError(res, err.message, err.statusCode)
      console.error(err)
      return sendError(res, 'Внутренняя ошибка сервера', 500)
    }
  },

  async sendMessage(req: any, res: Response) {
    try {
      const message = await chatService.sendMessage(req.params.id, req.userId, req.body.text)
      return sendSuccess(res, message, 201)
    } catch (err) {
      if (err instanceof AppError) return sendError(res, err.message, err.statusCode)
      console.error(err)
      return sendError(res, 'Внутренняя ошибка сервера', 500)
    }
  },
}
