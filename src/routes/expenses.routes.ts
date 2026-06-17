import { Router } from 'express';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expenses.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createExpenseSchema,
  updateExpenseSchema,
  getExpenseSchema,
  getExpensesSchema,
} from '../validators/expenses.validator';

const router = Router();

router.use(authenticate);

router.get('/', validate(getExpensesSchema), getExpenses);
router.get('/:id', validate(getExpenseSchema), getExpenseById);
router.post('/', validate(createExpenseSchema), createExpense);
router.put('/:id', validate(updateExpenseSchema), updateExpense);
router.delete('/:id', deleteExpense);

export default router;
