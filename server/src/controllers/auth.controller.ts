import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { UserModel } from '../models/User.model';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { config } from '../config/env';

interface JwtPayload {
  userId: string;
  type: 'access' | 'refresh';
}

const generateTokens = (userId: string) => {
  // Ensure the secrets are strings
  const jwtSecret = String(config.JWT_SECRET);
  const jwtRefreshSecret = String(config.JWT_REFRESH_SECRET);
  
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    jwtSecret,
    { expiresIn: config.JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    jwtRefreshSecret,
    { expiresIn: config.JWT_REFRESH_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', { errors: errors.array() });
    }

    const { email, password, name, timezone } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new AppError(409, 'User already exists', 'USER_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await UserModel.create({
      email,
      password: hashedPassword,
      profile: {
        name,
        timezone: timezone || 'UTC',
        preferences: {
          notifications: {
            email: true,
            sms: false,
            push: true,
            inApp: true,
            quietHours: {
              enabled: false,
              start: '22:00',
              end: '08:00',
            },
          },
          workingHours: {
            enabled: false,
            schedule: {
              monday: { enabled: true, start: '09:00', end: '17:00' },
              tuesday: { enabled: true, start: '09:00', end: '17:00' },
              wednesday: { enabled: true, start: '09:00', end: '17:00' },
              thursday: { enabled: true, start: '09:00', end: '17:00' },
              friday: { enabled: true, start: '09:00', end: '17:00' },
              saturday: { enabled: false, start: '09:00', end: '17:00' },
              sunday: { enabled: false, start: '09:00', end: '17:00' },
            },
          },
          theme: 'system',
          language: 'en',
        },
      },
    });

    const tokens = generateTokens(user._id.toString());

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      user: {
        id: user._id.toString(),
        email: user.email,
        profile: user.profile,
      },
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', { errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    const tokens = generateTokens(user._id.toString());

    logger.info(`User logged in: ${email}`);

    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        profile: user.profile,
      },
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError(401, 'Refresh token required', 'TOKEN_REQUIRED');
    }

    const jwtRefreshSecret = String(config.JWT_REFRESH_SECRET);
    const decoded = jwt.verify(refreshToken, jwtRefreshSecret) as JwtPayload;
    
    if (decoded.type !== 'refresh') {
      throw new AppError(401, 'Invalid token type', 'INVALID_TOKEN');
    }

    const tokens = generateTokens(decoded.userId);

    res.json(tokens);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError(401, 'Refresh token expired', 'TOKEN_EXPIRED'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'Invalid refresh token', 'INVALID_TOKEN'));
    } else {
      next(error);
    }
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    logger.info(`User logged out: ${userId}`);

    res.json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        profile: user.profile,
      },
    });
  } catch (error) {
    next(error);
  }
};