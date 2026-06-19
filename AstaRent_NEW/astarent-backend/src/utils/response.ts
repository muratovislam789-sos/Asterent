import { Response } from 'express'

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200, message?: string) =>
  res.status(statusCode).json({ success: true, data, ...(message && { message }) })

export const sendError = (res: Response, error: string, statusCode = 400) =>
  res.status(statusCode).json({ success: false, error })
