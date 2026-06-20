import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../config/cloudinary'

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async () => {
    return {
      folder: 'astarent',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, height: 900, crop: 'limit' }],
    }
  },
})

const fileFilter = function (_req: any, file: any, cb: any) {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  cb(null, allowed.includes(file.mimetype))
}

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, files: 10 },
})
