import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import path from 'path'
import pool from './config/database'
import { connectRedis } from './config/redis'
import { verifyToken } from './utils/jwt'
import { chatRepository } from './repositories/chatRepository'
import authRoutes from './routes/auth'
import listingRoutes from './routes/listings'
import chatRoutes from './routes/chats'
import historyRoutes from './routes/history'

const app = express()
const httpServer = createServer(app)
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

const io = new Server(httpServer, {
  cors: { origin: FRONTEND_URL, methods: ['GET', 'POST'], credentials: true },
})

app.use(cors({ origin: FRONTEND_URL, credentials: true }))
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/listings', listingRoutes)
app.use('/api/chats', chatRoutes)
app.use('/api/history', historyRoutes)

app.get('/api/health', async (_, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ success: true, status: 'healthy' })
  } catch {
    res.status(503).json({ success: false, status: 'unhealthy' })
  }
})

app.use((_req: any, res: any) => {
  res.status(404).json({ success: false, error: 'Маршрут не найден' })
})

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Unhandled error:', err)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, error: 'Файл слишком большой (максимум 5 МБ)' })
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, error: 'Некорректный формат данных запроса' })
  }
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Внутренняя ошибка сервера',
  })
})

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason)
})
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
})

io.use((socket, next) => {
  const token = socket.handshake.auth?.token
  if (!token) return next(new Error('Auth required'))
  try {
    const payload = verifyToken(token)
    socket.data.userId = payload.userId
    socket.data.role = payload.role
    next()
  } catch {
    next(new Error('Invalid token'))
  }
})

io.on('connection', (socket) => {
  const userId = socket.data.userId
  socket.join(`user:${userId}`)

  socket.on('join_chat', ({ chatId }: { chatId: string }) => {
    socket.join(`chat:${chatId}`)
  })

  socket.on('send_message', async ({ chatId, text }: { chatId: string; text: string }) => {
    try {
      const chat = await chatRepository.findById(chatId)
      if (!chat) return
      if (chat.tenant.id !== userId && chat.landlord.id !== userId) return
      const message = await chatRepository.saveMessage(chatId, userId, text.trim())
      socket.to(`chat:${chatId}`).emit('new_message', message)
      socket.emit('message_sent', message)
      const otherId = chat.tenant.id === userId ? chat.landlord.id : chat.tenant.id
      io.to(`user:${otherId}`).emit('new_message', message)
    } catch (err) {
      console.error('Message error:', err)
    }
  })

  socket.on('mark_read', async ({ chatId }: { chatId: string }) => {
    try { await chatRepository.markAsRead(chatId, userId) } catch (err) {
      console.error('Mark read error:', err)
    }
  })
})

const PORT = Number(process.env.PORT) || 5000

const start = async () => {
  try {
    await pool.query('SELECT 1')
    await connectRedis()
    httpServer.listen(PORT, () => {
      console.log(`AstaRent server running on port ${PORT}`)
    })
  } catch (err) {
    console.error('Failed to start:', err)
    process.exit(1)
  }
}

start()
