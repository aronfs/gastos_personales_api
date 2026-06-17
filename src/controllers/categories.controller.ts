import { Response, NextFunction } from 'express';
import { categoriesService } from '../services/categories.service';
import { sendSuccess, sendCreated, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

/**
 * @swagger
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all categories of the authenticated user
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
 *         name: type
 *         schema: { type: string, enum: [INCOME, EXPENSE] }
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
export const getCategories = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { page, limit, type } = req.query;
    const result = await categoriesService.getAll(req.user!.sub, page, limit, type as string);
    sendSuccess(res, result.categories, 'Categories retrieved successfully', 200, result.meta);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get category by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *       404:
 *         description: Category not found
 */
export const getCategoryById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const category = await categoriesService.getById(req.params.id, req.user!.sub);
    sendSuccess(res, category, 'Category retrieved successfully');
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'Category not found', err.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create a new category
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type]
 *             properties:
 *               name: { type: string, example: Food }
 *               icon: { type: string, example: utensils }
 *               color: { type: string, example: "#FF5733" }
 *               type: { type: string, enum: [INCOME, EXPENSE] }
 *     responses:
 *       201:
 *         description: Category created successfully
 *       409:
 *         description: Category with name and type already exists
 */
export const createCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const category = await categoriesService.create(req.user!.sub, req.body);
    sendCreated(res, category, 'Category created successfully');
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'Category creation failed', err.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Update an existing category
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
 *               name: { type: string, example: Groceries }
 *               icon: { type: string, example: shopping-basket }
 *               color: { type: string, example: "#00FF00" }
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category with name already exists
 */
export const updateCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const category = await categoriesService.update(req.params.id, req.user!.sub, req.body);
    sendSuccess(res, category, 'Category updated successfully');
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'Category update failed', err.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete a category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Cannot delete category with existing transactions
 *       404:
 *         description: Category not found
 */
export const deleteCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await categoriesService.delete(req.params.id, req.user!.sub);
    sendSuccess(res, null, 'Category deleted successfully');
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'Category deletion failed', err.statusCode);
      return;
    }
    next(error);
  }
};
