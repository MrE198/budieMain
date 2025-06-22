import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AppError } from '../utils/AppError';

interface JwtPayload {
  userId: string;
  type: string;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'No token provided', 'NO_TOKEN');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;

    if (decoded.type !== 'access') {
      throw new AppError(401, 'Invalid token type', 'INVALID_TOKEN');
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError(401, 'Token expired', 'TOKEN_EXPIRED'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'Invalid token', 'INVALID_TOKEN'));
    } else {
      next(error);
    }
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;

    if (decoded.type === 'access') {
      req.userId = decoded.userId;
    }

    next();
  } catch (error) {
    next();
  }
};