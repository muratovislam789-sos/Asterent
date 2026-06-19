import { Router } from 'express'
import { authController } from '../controllers/authController'
import { authenticate } from '../middleware/auth'
import { upload } from '../middleware/upload'

const router = Router()
router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/refresh', authController.refresh)
router.post('/logout', authenticate, authController.logout)
router.get('/me', authenticate, authController.getMe)
router.put('/profile', authenticate, upload.single('avatar'), authController.updateProfile)
export default router
