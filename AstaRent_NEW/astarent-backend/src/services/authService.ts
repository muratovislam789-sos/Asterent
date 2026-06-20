import { userRepository } from '../repositories/userRepository'
import { signToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt'
import redisClient from '../config/redis'
import { CreateUserDTO } from '../models/User'

// Кастомная ошибка с HTTP статус кодом — чтобы контроллер знал какой код вернуть
export class AppError extends Error {
  statusCode: number
  constructor(message: string, statusCode = 400) {
    super(message)
    this.statusCode = statusCode
  }
}

export const authService = {
  async register(dto: CreateUserDTO) {
    // Бизнес-правила регистрации
    if (!dto.name || !dto.email || !dto.password || !dto.role) {
      throw new AppError('Все поля обязательны')
    }
    if (!['tenant', 'landlord'].includes(dto.role)) {
      throw new AppError('Неверная роль')
    }
    if (dto.password.length < 8) {
      throw new AppError('Пароль должен быть не менее 8 символов')
    }

    const existing = await userRepository.findByEmail(dto.email)
    if (existing) {
      throw new AppError('Email уже используется', 409)
    }

    const user = await userRepository.create(dto.name, dto.email, dto.password, dto.role)
    const token = signToken({ userId: user.id, role: user.role })
    const refreshToken = signRefreshToken({ userId: user.id })
    await redisClient.setEx(`refresh:${user.id}`, 7 * 24 * 3600, refreshToken)

    return { user, token, refreshToken }
  },

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new AppError('Email и пароль обязательны')
    }

    const user = await userRepository.findByEmail(email)
    if (!user) {
      throw new AppError('Неверный email или пароль', 401)
    }

    const valid = await userRepository.comparePassword(password, user.password!)
    if (!valid) {
      throw new AppError('Неверный email или пароль', 401)
    }

    delete user.password
    const token = signToken({ userId: user.id, role: user.role })
    const refreshToken = signRefreshToken({ userId: user.id })
    await redisClient.setEx(`refresh:${user.id}`, 7 * 24 * 3600, refreshToken)

    return { user, token, refreshToken }
  },

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new AppError('Refresh token required', 401)
    }
    let payload
    try {
      payload = verifyRefreshToken(refreshToken)
    } catch {
      throw new AppError('Invalid refresh token', 401)
    }

    const stored = await redisClient.get(`refresh:${payload.userId}`)
    if (stored !== refreshToken) {
      throw new AppError('Invalid refresh token', 401)
    }

    const user = await userRepository.findById(payload.userId)
    if (!user) {
      throw new AppError('User not found', 401)
    }

    const token = signToken({ userId: user.id, role: user.role })
    return { token }
  },

  async logout(userId: string) {
    await redisClient.del(`refresh:${userId}`)
  },

  async getMe(userId: string) {
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new AppError('User not found', 404)
    }
    return user
  },

  async updateProfile(userId: string, name?: string, phone?: string, avatar?: string) {
    return userRepository.update(userId, {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(avatar && { avatar }),
    })
  },
}
