import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import { sendError } from '../utils/response'

export interface AuthRequest extends Request {
  userId?: string
  userRole?: string
}

// Обязательная авторизация — без токена запрос отклоняется
export const authenticate = (req: any, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) return sendError(res, 'Необходима авторизация', 401)

  try {
    const payload = verifyToken(auth.slice(7))
    req.userId = payload.userId
    req.userRole = payload.role
    next()
  } catch {
    return sendError(res, 'Токен недействителен или истёк', 401)
  }
}

// Необязательная авторизация — если токен есть и валиден, заполняет req.userId.
// Если токена нет или он невалиден — просто пропускает дальше без ошибки.
// Нужна для публичных роутов (например просмотр объявления),
// где поведение немного меняется для авторизованных пользователей
// (например запись в историю просмотров), но гости тоже должны иметь доступ.
export const optionalAuthenticate = (req: any, _res: Response, next: NextFunction) => {
  const auth = req.headers.authorization
  if (auth && auth.startsWith('Bearer ')) {
    try {
      const payload = verifyToken(auth.slice(7))
      req.userId = payload.userId
      req.userRole = payload.role
    } catch {
      // Невалидный токен — просто игнорируем, пользователь будет как гость
    }
  }
  next()
}

export const requireRole = (role: string) => (req: any, res: Response, next: NextFunction) => {
  if (req.userRole !== role) return sendError(res, 'Недостаточно прав', 403)
  next()
}
