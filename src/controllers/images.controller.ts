import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { imagesService } from '../services/images.service';
import { sendSuccess, sendError } from '../utils/response';

export const uploadImage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.file) {
      sendError(res, 'Image file is required', 400);
      return;
    }

    const result = await imagesService.upload(req.file, req.body);

    sendSuccess(res, result, 'Image uploaded successfully');
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'Image upload failed', err.statusCode);
      return;
    }
    next(error);
  }
};
