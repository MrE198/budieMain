import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.data && { data: err.data }),
      },
      metadata: {
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      },
    });
    return;
  }

  // Log unexpected errors
  logger.error('Unexpected error:', err);

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: isDevelopment ? err.message : 'An unexpected error occurred',
      ...(isDevelopment && { stack: err.stack }),
    },
    metadata: {
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    },
  });
};