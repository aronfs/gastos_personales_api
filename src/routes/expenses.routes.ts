import { Router } from 'express';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expenses.controller';
import {
  createSupermarketPurchase,
  getSupermarketPurchase,
} from '../controllers/supermarket.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createExpenseSchema,
  updateExpenseSchema,
  getExpenseSchema,
  getExpensesSchema,
} from '../validators/expenses.validator';
import {
  createSupermarketPurchaseSchema,
  getSupermarketPurchaseSchema,
} from '../validators/supermarket.validator';

const router = Router();

router.use(authenticate);

// Supermarket routes (must be before /:id to avoid param conflicts)
router.post('/supermarket', validate(createSupermarketPurchaseSchema), createSupermarketPurchase);
router.get('/supermarket/:id', validate(getSupermarketPurchaseSchema), getSupermarketPurchase);

// Standard expense CRUD routes
router.get('/', validate(getExpensesSchema), getExpenses);
router.get('/:id', validate(getExpenseSchema), getExpenseById);
router.post('/', validate(createExpenseSchema), createExpense);
router.put('/:id', validate(updateExpenseSchema), updateExpense);
router.delete('/:id', deleteExpense);

export default router;
