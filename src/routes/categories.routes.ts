import { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categories.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createCategorySchema,
  updateCategorySchema,
  getCategorySchema,
  getCategoriesSchema,
} from '../validators/categories.validator';

const router = Router();

router.use(authenticate);

router.get('/', validate(getCategoriesSchema), getCategories);
router.get('/:id', validate(getCategorySchema), getCategoryById);
router.post('/', validate(createCategorySchema), createCategory);
router.put('/:id', validate(updateCategorySchema), updateCategory);
router.delete('/:id', deleteCategory);

export default router;
