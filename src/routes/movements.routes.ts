import { Router } from 'express';
import {
  getMovements,
  getMovementById,
  getMovementSummary,
} from '../controllers/movements.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  getMovementsSchema,
  getMovementByIdSchema,
  getMovementSummarySchema,
} from '../validators/movements.validator';

const router = Router();

// All movements routes require authentication
router.use(authenticate);

// IMPORTANT: /summary must be declared before /:id to avoid Express
// treating the string "summary" as a UUID parameter.
router.get('/summary', validate(getMovementSummarySchema), getMovementSummary);
router.get('/', validate(getMovementsSchema), getMovements);
router.get('/:id', validate(getMovementByIdSchema), getMovementById);

export default router;
