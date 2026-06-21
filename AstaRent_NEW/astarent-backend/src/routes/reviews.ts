import { Router } from 'express'
import { reviewController } from '../controllers/reviewController'
import { authenticate } from '../middleware/auth'

const router = Router()
router.post('/', authenticate, reviewController.create)
router.get('/landlord/:landlordId', reviewController.getByLandlord)
export default router
