import { z } from 'zod';

export const createSupermarketPurchaseSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid('Invalid category ID'),
    description: z.string().max(500).optional().nullable(),
    transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
    products: z
      .array(
        z.object({
          productId: z.string().uuid('Invalid product ID'),
          quantity: z
            .number({ invalid_type_error: 'Quantity must be a number' })
            .int('Quantity must be an integer')
            .positive('Quantity must be positive'),
        }),
      )
      .min(1, 'At least one product is required'),
  }),
});

export const getSupermarketPurchaseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid expense ID'),
  }),
});

export type CreateSupermarketPurchaseInput = z.infer<typeof createSupermarketPurchaseSchema>['body'];
