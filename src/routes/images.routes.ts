import { Router } from 'express';
import { uploadImage } from '../controllers/images.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { upload as uploadMiddleware } from '../middlewares/upload.middleware';
import { uploadImageSchema } from '../validators/images.validator';

const router = Router();

router.use(authenticate);

router.post('/upload', uploadMiddleware.single('image'), validate(uploadImageSchema), uploadImage);

export default router;
