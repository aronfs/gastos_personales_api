import { z } from 'zod';

export const createExpenseSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid('Invalid category ID'),
    amount: z
      .number({ invalid_type_error: 'Amount must be a number' })
      .positive('Amount must be positive')
      .multipleOf(0.01, 'Amount can have at most 2 decimal places'),
    description: z.string().max(500).optional().nullable(),
    transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  }),
});

export const updateExpenseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid expense ID'),
  }),
  body: z.object({
    categoryId: z.string().uuid('Invalid category ID').optional(),
    amount: z
      .number({ invalid_type_error: 'Amount must be a number' })
      .positive('Amount must be positive')
      .multipleOf(0.01)
      .optional(),
    description: z.string().max(500).optional().nullable(),
    transactionDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format')
      .optional(),
  }),
});

export const getExpenseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid expense ID'),
  }),
});

export const getExpensesSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  }),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>['body'];
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>['body'];
