import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { profileImageService } from '../services/profile-image.service';
import { sendSuccess, sendError } from '../utils/response';

export const getProfileImage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const image = await profileImageService.getByUserId(userId);

    sendSuccess(res, image, 'Profile image retrieved successfully');
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'Profile image not found', err.statusCode);
      return;
    }
    next(error);
  }
};

export const getProfileImageFile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const fileUrl = await profileImageService.getFileUrl(userId);

    res.redirect(fileUrl);
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'Profile image not found', err.statusCode);
      return;
    }
    next(error);
  }
};

export const uploadProfileImage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.file) {
      sendError(res, 'Image file is required', 400);
      return;
    }

    const userId = req.user!.sub;
    const image = await profileImageService.upload(userId, req.file);

    sendSuccess(res, image, 'Profile image uploaded successfully');
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'Profile image upload failed', err.statusCode);
      return;
    }
    next(error);
  }
};

export const deleteProfileImage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.sub;
    await profileImageService.delete(userId);

    sendSuccess(res, null, 'Profile image deleted successfully');
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      sendError(res, err.message || 'Profile image deletion failed', err.statusCode);
      return;
    }
    next(error);
  }
};
