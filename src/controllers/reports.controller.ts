import { Response, NextFunction } from 'express';
import { reportsService } from '../services/reports.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

/**
 * @swagger
 * /reports/monthly:
 *   get:
 *     tags: [Reports]
 *     summary: Get monthly income and expense report
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema: { type: string, example: "2026" }
 *       - in: query
 *         name: month
 *         schema: { type: string, example: "6" }
 *     responses:
 *       200:
 *         description: Monthly report retrieved successfully
 *       400:
 *         description: Invalid parameters
 */
export const getMonthlyReport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { year, month } = req.query;
    const result = await reportsService.getMonthlyReport(
      req.user!.sub,
      year as string,
      month as string,
    );
    sendSuccess(res, result, 'Monthly report retrieved successfully');
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'Failed to retrieve monthly report', err.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /reports/yearly:
 *   get:
 *     tags: [Reports]
 *     summary: Get yearly income and expense report
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema: { type: string, example: "2026" }
 *     responses:
 *       200:
 *         description: Yearly report retrieved successfully
 */
export const getYearlyReport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { year } = req.query;
    const result = await reportsService.getYearlyReport(req.user!.sub, year as string);
    sendSuccess(res, result, 'Yearly report retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /reports/categories:
 *   get:
 *     tags: [Reports]
 *     summary: Get breakdown of incomes and expenses by categories for a period
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date, example: "2026-06-01" }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date, example: "2026-06-30" }
 *     responses:
 *       200:
 *         description: Categories report retrieved successfully
 */
export const getCategoriesReport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const result = await reportsService.getCategoriesReport(
      req.user!.sub,
      startDate as string,
      endDate as string,
    );
    sendSuccess(res, result, 'Categories report retrieved successfully');
  } catch (error) {
    next(error);
  }
};
