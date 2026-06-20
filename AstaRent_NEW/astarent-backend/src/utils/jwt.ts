import jwt, { SignOptions } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_in_production'
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret'

export const signToken = (payload: object) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any })

export const signRefreshToken = (payload: object) =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any })

export const verifyToken = (token: string) =>
  jwt.verify(token, JWT_SECRET) as jwt.JwtPayload

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, REFRESH_SECRET) as jwt.JwtPayload