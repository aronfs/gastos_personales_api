import { z } from 'zod';

const folderRegex = /^[a-zA-Z0-9_/-]+$/;

export const uploadImageSchema = z.object({
  body: z.object({
    folder: z
      .string({ required_error: 'folder is required' })
      .min(1, 'folder is required')
      .max(200, 'folder must not exceed 200 characters')
      .regex(folderRegex, {
        message:
          'folder can only contain letters, numbers, underscores, hyphens and forward slashes',
      }),
  }),
});

export type UploadImageInput = z.infer<typeof uploadImageSchema>['body'];
