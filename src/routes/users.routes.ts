import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/users.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
  getUsersSchema,
} from '../validators/users.validator';

const router = Router();

// Apply auth and admin check to all user routes
router.use(authenticate, requireAdmin);

router.get('/', validate(getUsersSchema), getUsers);
router.get('/:id', validate(getUserSchema), getUserById);
router.post('/', validate(createUserSchema), createUser);
router.put('/:id', validate(updateUserSchema), updateUser);
router.delete('/:id', deleteUser);

export default router;
