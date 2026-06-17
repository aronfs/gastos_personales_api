import { Response, NextFunction } from 'express';
import { sendForbidden } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export const requireRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendForbidden(res, 'Authentication required');
      return;
    }

    const userRoles = req.user.roles || [];
    const hasRole = roles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      sendForbidden(res, 'Insufficient permissions');
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole('ADMIN');
