import { Response, NextFunction } from 'express';
import { productsService } from '../services/products.service';
import { sendSuccess, sendCreated, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

/**
 * @swagger
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: Get all products
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
 *         name: active
 *         schema: { type: string, enum: [true, false] }
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
export const getProducts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { page, limit, categoryId, active } = req.query;
    const result = await productsService.getAll(page, limit, {
      categoryId: categoryId as string,
      active: active as string,
    });
    sendSuccess(res, result.products, 'Products retrieved successfully', 200, result.meta);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 */
export const getProductById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const product = await productsService.getById(req.params.id);
    sendSuccess(res, product, 'Product retrieved successfully');
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'Product not found', err.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: Create a new product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryId, name, unitPrice]
 *             properties:
 *               categoryId: { type: string, format: uuid }
 *               name: { type: string, example: "Arroz" }
 *               description: { type: string, example: "Arroz integral 1kg" }
 *               unitPrice: { type: number, example: 1.50 }
 *     responses:
 *       201:
 *         description: Product created successfully
 *       404:
 *         description: Category not found
 */
export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const product = await productsService.create(req.user!.sub, req.body);
    sendCreated(res, product, 'Product created successfully');
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'Product creation failed', err.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update an existing product
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
 *               categoryId: { type: string, format: uuid }
 *               name: { type: string, example: "Arroz Integral" }
 *               description: { type: string, example: "Arroz integral premium 1kg" }
 *               unitPrice: { type: number, example: 1.75 }
 *               active: { type: boolean, example: true }
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product or Category not found
 */
export const updateProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const product = await productsService.update(req.params.id, req.user!.sub, req.body);
    sendSuccess(res, product, 'Product updated successfully');
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'Product update failed', err.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Deactivate a product (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
export const deleteProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await productsService.delete(req.params.id);
    sendSuccess(res, null, 'Product deleted successfully');
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'Product deletion failed', err.statusCode);
      return;
    }
    next(error);
  }
};
