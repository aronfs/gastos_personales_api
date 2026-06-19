import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { profileService } from '../services/profile.service';
import { sendSuccess } from '../utils/response';

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const profile = await profileService.getProfile(userId);
    
    sendSuccess(res, profile, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.sub;
    await profileService.updateProfile(userId, req.body);
    
    sendSuccess(res, {}, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};
