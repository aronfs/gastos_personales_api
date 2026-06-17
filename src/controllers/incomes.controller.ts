import { Response, NextFunction } from 'express';
import { incomesService } from '../services/incomes.service';
import { sendSuccess, sendCreated, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

/**
 * @swagger
 * /incomes:
 *   get:
 *     tags: [Incomes]
 *     summary: Get all incomes of the authenticated user
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
 *         description: Incomes retrieved successfully
 */
export const getIncomes = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { page, limit, categoryId, startDate, endDate } = req.query;
    const result = await incomesService.getAll(req.user!.sub, page, limit, {
      categoryId: categoryId as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });
    sendSuccess(res, result.incomes, 'Incomes retrieved successfully', 200, result.meta);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /incomes/{id}:
 *   get:
 *     tags: [Incomes]
 *     summary: Get income by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Income retrieved successfully
 *       404:
 *         description: Income not found
 */
export const getIncomeById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const income = await incomesService.getById(req.params.id, req.user!.sub);
    sendSuccess(res, income, 'Income retrieved successfully');
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'Income not found', err.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /incomes:
 *   post:
 *     tags: [Incomes]
 *     summary: Create a new income
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
 *               categoryId: { type: string, format: uuid, example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" }
 *               amount: { type: number, example: 1500.50 }
 *               description: { type: string, example: "Monthly salary" }
 *               transactionDate: { type: string, format: date, example: "2026-06-17" }
 *     responses:
 *       201:
 *         description: Income created successfully
 *       400:
 *         description: Invalid category or input
 *       404:
 *         description: Category not found
 */
export const createIncome = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const income = await incomesService.create(req.user!.sub, req.body);
    sendCreated(res, income, 'Income created successfully');
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'Income creation failed', err.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /incomes/{id}:
 *   put:
 *     tags: [Incomes]
 *     summary: Update an existing income
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
 *               categoryId: { type: string, format: uuid, example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" }
 *               amount: { type: number, example: 1600.00 }
 *               description: { type: string, example: "Monthly salary updated" }
 *               transactionDate: { type: string, format: date, example: "2026-06-17" }
 *     responses:
 *       200:
 *         description: Income updated successfully
 *       400:
 *         description: Invalid category or input
 *       404:
 *         description: Income or Category not found
 */
export const updateIncome = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const income = await incomesService.update(req.params.id, req.user!.sub, req.body);
    sendSuccess(res, income, 'Income updated successfully');
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'Income update failed', err.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /incomes/{id}:
 *   delete:
 *     tags: [Incomes]
 *     summary: Delete an income record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Income deleted successfully
 *       404:
 *         description: Income not found
 */
export const deleteIncome = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await incomesService.delete(req.params.id, req.user!.sub);
    sendSuccess(res, null, 'Income deleted successfully');
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'Income deletion failed', err.statusCode);
      return;
    }
    next(error);
  }
};
