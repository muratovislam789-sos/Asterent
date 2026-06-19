import { Router } from 'express'
import { chatController } from '../controllers/chatController'
import { authenticate } from '../middleware/auth'

const router = Router()
router.get('/', authenticate, chatController.getChats)
router.post('/', authenticate, chatController.startChat)
router.get('/:id', authenticate, chatController.getChat)
router.get('/:id/messages', authenticate, chatController.getMessages)
router.post('/:id/messages', authenticate, chatController.sendMessage)
export default router
