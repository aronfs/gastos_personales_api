import { Router } from 'express';
import { getProfile, updateProfile, deactivateProfile } from '../controllers/profile.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { updateProfileSchema, deactivateProfileSchema } from '../validators/profile.validator';

const router = Router();

// Require authentication for all profile routes
router.use(authenticate);

router.get('/', getProfile);
router.put('/', validate(updateProfileSchema), updateProfile);
router.patch('/deactivate', validate(deactivateProfileSchema), deactivateProfile);

export default router;
