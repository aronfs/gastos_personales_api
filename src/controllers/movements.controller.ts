import { Response, NextFunction } from 'express';
import { movementsService } from '../services/movements.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

/**
 * @swagger
 * /movements:
 *   get:
 *     tags: [Movements]
 *     summary: Get unified list of incomes and expenses
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [INCOME, EXPENSE] }
 *         description: Filter by movement type
 *       - in: query
 *         name: categoryId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date, example: "2026-01-01" }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date, example: "2026-12-31" }
 *     responses:
 *       200:
 *         description: Paginated list of movements sorted by date DESC
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Movement'
 *                     meta:
 *                       $ref: '#/components/schemas/PaginationMeta'
 */
export const getMovements = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { page, limit, type, categoryId, startDate, endDate } = req.query;

    const result = await movementsService.getAll(
      req.user!.sub,
      page,
      limit,
      {
        type: type as 'INCOME' | 'EXPENSE' | undefined,
        categoryId: categoryId as string | undefined,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
      },
    );

    sendSuccess(res, result.movements, 'Movements retrieved', 200, result.meta);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /movements/summary:
 *   get:
 *     tags: [Movements]
 *     summary: Get financial summary for a date range
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date, example: "2026-06-01" }
 *         description: Defaults to start of current month
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date, example: "2026-06-30" }
 *         description: Defaults to end of current month
 *     responses:
 *       200:
 *         description: Financial summary
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MovementSummary'
 */
export const getMovementSummary = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const summary = await movementsService.getSummary(
      req.user!.sub,
      startDate as string | undefined,
      endDate as string | undefined,
    );

    sendSuccess(res, summary, 'Movement summary retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /movements/{id}:
 *   get:
 *     tags: [Movements]
 *     summary: Get a single movement by ID (searches incomes then expenses)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Movement found
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Movement'
 *       404:
 *         description: Movement not found
 */
export const getMovementById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const movement = await movementsService.getById(req.params.id, req.user!.sub);
    sendSuccess(res, movement, 'Movement retrieved');
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'Movement not found', err.statusCode);
      return;
    }
    next(error);
  }
};
