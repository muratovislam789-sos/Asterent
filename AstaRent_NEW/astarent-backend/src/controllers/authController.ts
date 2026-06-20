import { Request, Response } from 'express'
import { userRepository } from '../repositories/userRepository'
import { signToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt'
import { sendSuccess, sendError } from '../utils/response'
import redisClient from '../config/redis'

export const authController = {
  async register(req: Request, res: Response) {
    const { name, email, password, role } = req.body
    if (!name || !email || !password || !role) return sendError(res, 'Все поля обязательны')
    if (!['tenant', 'landlord'].includes(role)) return sendError(res, 'Неверная роль')
    if (password.length < 8) return sendError(res, 'Пароль должен быть не менее 8 символов')

    const existing = await userRepository.findByEmail(email)
    if (existing) return sendError(res, 'Email уже используется', 409)

    const user = await userRepository.create(name, email, password, role)
    const token = signToken({ userId: user.id, role: user.role })
    const refreshToken = signRefreshToken({ userId: user.id })
    await redisClient.setEx(`refresh:${user.id}`, 7 * 24 * 3600, refreshToken)

    return sendSuccess(res, { user, token, refreshToken }, 201)
  },

  async login(req: Request, res: Response) {
    const { email, password } = req.body
    if (!email || !password) return sendError(res, 'Email и пароль обязательны')

    const user = await userRepository.findByEmail(email)
    if (!user) return sendError(res, 'Неверный email или пароль', 401)

    const valid = await userRepository.comparePassword(password, user.password!)
    if (!valid) return sendError(res, 'Неверный email или пароль', 401)

    delete user.password
    const token = signToken({ userId: user.id, role: user.role })
    const refreshToken = signRefreshToken({ userId: user.id })
    await redisClient.setEx(`refresh:${user.id}`, 7 * 24 * 3600, refreshToken)

    return sendSuccess(res, { user, token, refreshToken })
  },

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body
    if (!refreshToken) return sendError(res, 'Refresh token required', 401)
    try {
      const payload = verifyRefreshToken(refreshToken)
      const stored = await redisClient.get(`refresh:${payload.userId}`)
      if (stored !== refreshToken) return sendError(res, 'Invalid refresh token', 401)
      const user = await userRepository.findById(payload.userId)
      if (!user) return sendError(res, 'User not found', 401)
      const token = signToken({ userId: user.id, role: user.role })
      return sendSuccess(res, { token })
    } catch {
      return sendError(res, 'Invalid refresh token', 401)
    }
  },

  async logout(req: any, res: Response) {
    if (req.userId) await redisClient.del(`refresh:${req.userId}`)
    return sendSuccess(res, null, 200, 'Logged out')
  },

  async getMe(req: any, res: Response) {
    const user = await userRepository.findById(req.userId)
    if (!user) return sendError(res, 'User not found', 404)
    return sendSuccess(res, user)
  },

  async updateProfile(req: any, res: Response) {
    const { name, phone } = req.body
    // Cloudinary multer stores the full URL in file.path
    const avatar = req.file ? req.file.path : undefined
    const updated = await userRepository.update(req.userId, { ...(name && { name }), ...(phone && { phone }), ...(avatar && { avatar }) })
    return sendSuccess(res, updated)
  }
}
