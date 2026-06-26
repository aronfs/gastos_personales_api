import { z } from 'zod';

export const deleteProfileImageSchema = z.object({
  body: z.object({
    confirmation: z.literal('DELETE', {
      errorMap: () => ({ message: 'Must send confirmation: "DELETE"' }),
    }),
  }),
});
