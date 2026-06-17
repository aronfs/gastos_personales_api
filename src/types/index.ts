import { Request } from 'express';
import { JwtPayload } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

export interface TransactionFilter extends DateRangeFilter {
  categoryId?: string;
  page?: string;
  limit?: string;
}
