import { Router } from 'express';
import {
  getMonthlyReport,
  getYearlyReport,
  getCategoriesReport,
} from '../controllers/reports.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/monthly', getMonthlyReport);
router.get('/yearly', getYearlyReport);
router.get('/categories', getCategoriesReport);

export default router;
