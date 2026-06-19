import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid('Invalid category ID'),
    name: z
      .string({ required_error: 'Name is required' })
      .min(1, 'Name is required')
      .max(150, 'Name must not exceed 150 characters'),
    description: z.string().optional().nullable(),
    unitPrice: z
      .number({ invalid_type_error: 'Unit price must be a number' })
      .positive('Unit price must be positive')
      .multipleOf(0.01, 'Unit price can have at most 2 decimal places'),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
  body: z.object({
    categoryId: z.string().uuid('Invalid category ID').optional(),
    name: z.string().min(1, 'Name is required').max(150).optional(),
    description: z.string().optional().nullable(),
    unitPrice: z
      .number({ invalid_type_error: 'Unit price must be a number' })
      .positive('Unit price must be positive')
      .multipleOf(0.01)
      .optional(),
    active: z.boolean().optional(),
  }),
});

export const getProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
});

export const getProductsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    categoryId: z.string().uuid('Invalid category ID').optional(),
    active: z.enum(['true', 'false']).optional(),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
