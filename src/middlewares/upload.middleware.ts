import multer from 'multer';
import path from 'path';
import { env } from '../config/env';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.UPLOAD_MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: jpg, jpeg, png, webp`));
      return;
    }

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      cb(new Error(`Invalid file extension: ${ext}. Allowed: .jpg, .jpeg, .png, .webp`));
      return;
    }

    cb(null, true);
  },
});
