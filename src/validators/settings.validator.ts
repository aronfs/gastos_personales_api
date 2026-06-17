import { z } from 'zod';

export const updateSettingsSchema = z.object({
  body: z.object({
    currency: z.string().min(1).max(10).optional(),
    language: z.string().min(1).max(10).optional(),
    theme: z.enum(['light', 'dark', 'system']).optional(),
    notificationsEnabled: z.boolean().optional(),
  }),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>['body'];
