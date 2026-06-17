import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { updateSettingsSchema } from '../validators/settings.validator';

const router = Router();

router.use(authenticate);

router.get('/', getSettings);
router.put('/', validate(updateSettingsSchema), updateSettings);

export default router;
