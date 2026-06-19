import multer from 'multer'
import path from 'path'
import { v4 as uuid } from 'uuid'

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, process.env.UPLOAD_DIR || 'uploads'),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, uuid() + ext)
  },
})

const fileFilter = (_: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  cb(null, allowed.includes(file.mimetype))
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, files: 10 },
})
