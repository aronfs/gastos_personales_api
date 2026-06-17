import { Router } from 'express';
import {
  getIncomes,
  getIncomeById,
  createIncome,
  updateIncome,
  deleteIncome,
} from '../controllers/incomes.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createIncomeSchema,
  updateIncomeSchema,
  getIncomeSchema,
  getIncomesSchema,
} from '../validators/incomes.validator';

const router = Router();

router.use(authenticate);

router.get('/', validate(getIncomesSchema), getIncomes);
router.get('/:id', validate(getIncomeSchema), getIncomeById);
router.post('/', validate(createIncomeSchema), createIncome);
router.put('/:id', validate(updateIncomeSchema), updateIncome);
router.delete('/:id', deleteIncome);

export default router;
