import { Response, NextFunction } from 'express';
import { usersService } from '../services/users.service';
import { sendSuccess, sendCreated, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users (Admin only)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: active
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Users list
 */
export const getUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { page, limit, search, active } = req.query;
    const result = await usersService.getAll(page, limit, search as string, active as string);
    sendSuccess(res, result.users, 'Users retrieved', 200, result.meta);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
export const getUserById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await usersService.getById(req.params.id);
    sendSuccess(res, user, 'User retrieved');
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'User not found', err.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user (Admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               roles: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: User created
 */
export const createUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await usersService.create(req.body, req.user!.sub);
    sendCreated(res, user, 'User created successfully');
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'User creation failed', err.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update user
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
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               active: { type: boolean }
 *     responses:
 *       200:
 *         description: User updated
 */
export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await usersService.update(req.params.id, req.body, req.user!.sub);
    sendSuccess(res, user, 'User updated successfully');
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'User update failed', err.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user (Admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 */
export const deactivateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await usersService.deactivate(req.params.id, req.user!.sub);
    sendSuccess(res, null, 'User deactivated successfully');
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'User deactivation failed', err.statusCode);
      return;
    }
    next(error);
  }
};

export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await usersService.delete(req.params.id, req.user!.sub);
    sendSuccess(res, null, 'User deleted successfully');
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'User deletion failed', err.statusCode);
      return;
    }
    next(error);
  }
};
