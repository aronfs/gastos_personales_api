import { Router } from 'express';
import {
  getProfileImage,
  getProfileImageFile,
  uploadProfileImage,
  deleteProfileImage,
} from '../controllers/profile-image.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { upload as uploadMiddleware } from '../middlewares/upload.middleware';
import { deleteProfileImageSchema } from '../validators/profile-image.validator';

const router = Router();

router.use(authenticate);

router.get('/', getProfileImage);
router.get('/file', getProfileImageFile);
router.post('/', uploadMiddleware.single('image'), uploadProfileImage);
router.delete('/', validate(deleteProfileImageSchema), deleteProfileImage);

export default router;
