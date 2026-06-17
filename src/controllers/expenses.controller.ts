import { Response, NextFunction } from 'express';
import { expensesService } from '../services/expenses.service';
import { sendSuccess, sendCreated, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

/**
 * @swagger
 * /expenses:
 *   get:
 *     tags: [Expenses]
 *     summary: Get all expenses of the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: categoryId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Expenses retrieved successfully
 */
export const getExpenses = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { page, limit, categoryId, startDate, endDate } = req.query;
    const result = await expensesService.getAll(req.user!.sub, page, limit, {
      categoryId: categoryId as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });
    sendSuccess(res, result.expenses, 'Expenses retrieved successfully', 200, result.meta);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /expenses/{id}:
 *   get:
 *     tags: [Expenses]
 *     summary: Get expense by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Expense retrieved successfully
 *       404:
 *         description: Expense not found
 */
export const getExpenseById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const expense = await expensesService.getById(req.params.id, req.user!.sub);
    sendSuccess(res, expense, 'Expense retrieved successfully');
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'Expense not found', err.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /expenses:
 *   post:
 *     tags: [Expenses]
 *     summary: Create a new expense
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryId, amount, transactionDate]
 *             properties:
 *               categoryId: { type: string, format: uuid, example: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22" }
 *               amount: { type: number, example: 54.30 }
 *               description: { type: string, example: "Groceries at supermarket" }
 *               transactionDate: { type: string, format: date, example: "2026-06-17" }
 *     responses:
 *       201:
 *         description: Expense created successfully
 *       400:
 *         description: Invalid category or input
 *       404:
 *         description: Category not found
 */
export const createExpense = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const expense = await expensesService.create(req.user!.sub, req.body);
    sendCreated(res, expense, 'Expense created successfully');
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'Expense creation failed', err.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /expenses/{id}:
 *   put:
 *     tags: [Expenses]
 *     summary: Update an existing expense
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId: { type: string, format: uuid, example: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22" }
 *               amount: { type: number, example: 60.00 }
 *               description: { type: string, example: "Groceries at supermarket updated" }
 *               transactionDate: { type: string, format: date, example: "2026-06-17" }
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *       400:
 *         description: Invalid category or input
 *       404:
 *         description: Expense or Category not found
 */
export const updateExpense = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const expense = await expensesService.update(req.params.id, req.user!.sub, req.body);
    sendSuccess(res, expense, 'Expense updated successfully');
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'Expense update failed', err.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /expenses/{id}:
 *   delete:
 *     tags: [Expenses]
 *     summary: Delete an expense record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *       404:
 *         description: Expense not found
 */
export const deleteExpense = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await expensesService.delete(req.params.id, req.user!.sub);
    sendSuccess(res, null, 'Expense deleted successfully');
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'Expense deletion failed', err.statusCode);
      return;
    }
    next(error);
  }
};
