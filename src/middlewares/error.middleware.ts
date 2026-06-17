import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  logger.error(`${req.method} ${req.path} - ${error.message}`, { stack: error.stack });

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'Resource already exists',
        error: { code: error.code, field: (error.meta?.target as string[])?.join(', ') },
      });
      return;
    }
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Resource not found',
        error: { code: error.code },
      });
      return;
    }
    if (error.code === 'P2003') {
      res.status(400).json({
        success: false,
        message: 'Foreign key constraint failed',
        error: { code: error.code },
      });
      return;
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      success: false,
      message: 'Invalid data provided',
      error: { type: 'ValidationError' },
    });
    return;
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: { type: 'JsonWebTokenError' },
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token expired',
      error: { type: 'TokenExpiredError' },
    });
    return;
  }

  // Default 500
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error:
      process.env.NODE_ENV !== 'production'
        ? { message: error.message, stack: error.stack }
        : undefined,
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
};
