import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    first_name: z
      .string({
        required_error: 'first_name is required',
        invalid_type_error: 'first_name must be a string',
      })
      .min(2, 'first_name must be at least 2 characters')
      .max(100, 'first_name must not exceed 100 characters'),
    last_name: z
      .string({
        required_error: 'last_name is required',
        invalid_type_error: 'last_name must be a string',
      })
      .min(2, 'last_name must be at least 2 characters')
      .max(100, 'last_name must not exceed 100 characters'),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
