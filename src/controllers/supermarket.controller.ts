import { Response, NextFunction } from 'express';
import { supermarketService } from '../services/supermarket.service';
import { sendCreated, sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

/**
 * @swagger
 * /expenses/supermarket:
 *   post:
 *     tags: [Supermarket]
 *     summary: Create a supermarket purchase
 *     description: Creates an expense composed of multiple products. The total amount is calculated automatically.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryId, transactionDate, products]
 *             properties:
 *               categoryId: { type: string, format: uuid }
 *               description: { type: string, example: "Compra Supermaxi" }
 *               transactionDate: { type: string, format: date, example: "2026-06-18" }
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [productId, quantity]
 *                   properties:
 *                     productId: { type: string, format: uuid }
 *                     quantity: { type: integer, example: 2 }
 *     responses:
 *       201:
 *         description: Supermarket purchase created successfully
 *       400:
 *         description: Invalid input or category type
 *       404:
 *         description: Category or products not found
 */
export const createSupermarketPurchase = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await supermarketService.createPurchase(req.user!.sub, req.body);
    sendCreated(res, result, 'Supermarket purchase created successfully');
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'Supermarket purchase failed', err.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /expenses/supermarket/{id}:
 *   get:
 *     tags: [Supermarket]
 *     summary: Get a supermarket purchase by ID
 *     description: Retrieves an expense with its product details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Supermarket purchase retrieved successfully
 *       404:
 *         description: Purchase not found
 */
export const getSupermarketPurchase = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await supermarketService.getPurchaseById(req.params.id, req.user!.sub);
    sendSuccess(res, result, 'Supermarket purchase retrieved successfully');
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'Purchase not found', err.statusCode);
      return;
    }
    next(error);
  }
};
