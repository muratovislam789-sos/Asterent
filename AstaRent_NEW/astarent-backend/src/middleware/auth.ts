import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import { sendError } from '../utils/response'

export interface AuthRequest extends Request {
  userId?: string
  userRole?: string
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return sendError(res, 'Необходима авторизация', 401)

  try {
    const payload = verifyToken(auth.slice(7))
    req.userId = payload.userId
    req.userRole = payload.role
    next()
  } catch {
    return sendError(res, 'Токен недействителен или истёк', 401)
  }
}

export const requireRole = (role: string) => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== role) return sendError(res, 'Недостаточно прав', 403)
  next()
}
