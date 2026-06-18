import { z } from 'zod';

export const getMovementsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    categoryId: z.string().uuid('Invalid category ID').optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be YYYY-MM-DD')
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be YYYY-MM-DD')
      .optional(),
  }),
});

export const getMovementByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid movement ID'),
  }),
});

export const getMovementSummarySchema = z.object({
  query: z.object({
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be YYYY-MM-DD')
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be YYYY-MM-DD')
      .optional(),
  }),
});

export type MovementType = 'INCOME' | 'EXPENSE';

export interface MovementFilters {
  type?: MovementType;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}
