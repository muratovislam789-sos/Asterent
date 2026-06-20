import multer from 'multer'
import path from 'path'
import { v4 as uuid } from 'uuid'

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, process.env.UPLOAD_DIR || 'uploads')
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname)
    cb(null, uuid() + ext)
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
