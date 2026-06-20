import { Request, Response } from 'express'
import { authService, AppError } from '../services/authService'
import { sendSuccess, sendError } from '../utils/response'

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body)
      return sendSuccess(res, result, 201)
    } catch (err) {
      if (err instanceof AppError) return sendError(res, err.message, err.statusCode)
      console.error(err)
      return sendError(res, 'Внутренняя ошибка сервера', 500)
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body
      const result = await authService.login(email, password)
      return sendSuccess(res, result)
    } catch (err) {
      if (err instanceof AppError) return sendError(res, err.message, err.statusCode)
      console.error(err)
      return sendError(res, 'Внутренняя ошибка сервера', 500)
    }
  },

  async refresh(req: Request, res: Response) {
    try {
      const result = await authService.refresh(req.body.refreshToken)
      return sendSuccess(res, result)
    } catch (err) {
      if (err instanceof AppError) return sendError(res, err.message, err.statusCode)
      console.error(err)
      return sendError(res, 'Внутренняя ошибка сервера', 500)
    }
  },

  async logout(req: any, res: Response) {
    try {
      if (req.userId) await authService.logout(req.userId)
      return sendSuccess(res, null, 200, 'Logged out')
    } catch (err) {
      console.error(err)
      return sendError(res, 'Внутренняя ошибка сервера', 500)
    }
  },

  async getMe(req: any, res: Response) {
    try {
      const user = await authService.getMe(req.userId)
      return sendSuccess(res, user)
    } catch (err) {
      if (err instanceof AppError) return sendError(res, err.message, err.statusCode)
      console.error(err)
      return sendError(res, 'Внутренняя ошибка сервера', 500)
    }
  },

  async updateProfile(req: any, res: Response) {
    try {
      const { name, phone } = req.body
      const avatar = req.file ? req.file.path : undefined
      const updated = await authService.updateProfile(req.userId, name, phone, avatar)
      return sendSuccess(res, updated)
    } catch (err) {
      console.error(err)
      return sendError(res, 'Внутренняя ошибка сервера', 500)
    }
  },
}
