import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/products.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createProductSchema,
  updateProductSchema,
  getProductSchema,
  getProductsSchema,
} from '../validators/products.validator';

const router = Router();

router.use(authenticate);

router.get('/', validate(getProductsSchema), getProducts);
router.get('/:id', validate(getProductSchema), getProductById);
router.post('/', validate(createProductSchema), createProduct);
router.put('/:id', validate(updateProductSchema), updateProduct);
router.delete('/:id', validate(getProductSchema), deleteProduct);

export default router;
