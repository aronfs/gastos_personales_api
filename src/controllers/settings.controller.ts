import { Response, NextFunction } from 'express';
import { settingsService } from '../services/settings.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

/**
 * @swagger
 * /settings:
 *   get:
 *     tags: [Settings]
 *     summary: Get user settings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 */
export const getSettings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const settings = await settingsService.getByUserId(req.user!.sub);
    sendSuccess(res, settings, 'Settings retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /settings:
 *   put:
 *     tags: [Settings]
 *     summary: Update user settings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currency: { type: string, example: "USD" }
 *               language: { type: string, example: "es" }
 *               theme: { type: string, enum: [light, dark, system] }
 *               notificationsEnabled: { type: boolean, example: true }
 *     responses:
 *       200:
 *         description: Settings updated successfully
 */
export const updateSettings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const settings = await settingsService.update(req.user!.sub, req.body);
    sendSuccess(res, settings, 'Settings updated successfully');
  } catch (error) {
    next(error);
  }
};
