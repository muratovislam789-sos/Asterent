import { Router } from 'express'
import { listingController } from '../controllers/listingController'
import { authenticate, optionalAuthenticate, requireRole } from '../middleware/auth'
import { upload } from '../middleware/upload'

const router = Router()
router.get('/', optionalAuthenticate, listingController.getAll)
router.get('/my', authenticate, requireRole('landlord'), listingController.getMyListings)
router.get('/favorites', authenticate, listingController.getFavorites)
router.get('/:id', optionalAuthenticate, listingController.getById)
router.post('/', authenticate, requireRole('landlord'), upload.array('photos', 10), listingController.create)
router.put('/:id', authenticate, requireRole('landlord'), upload.array('photos', 10), listingController.update)
router.delete('/:id', authenticate, requireRole('landlord'), listingController.delete)
router.post('/:id/favorite', authenticate, listingController.toggleFavorite)
export default router
