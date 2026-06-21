import { Router } from 'express'
import { viewHistoryController } from '../controllers/viewHistoryController'
import { authenticate } from '../middleware/auth'

const router = Router()
router.get('/', authenticate, viewHistoryController.getHistory)
router.delete('/', authenticate, viewHistoryController.clearHistory)
export default router
