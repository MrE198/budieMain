import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { UserModel } from '../models/User.model';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { config } from '../config/env';

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    config.JWT_REFRESH_SECRET,
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

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new AppError(409, 'User already exists', 'USER_EXISTS');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await UserModel.create({
      email,
      password: hashedPassword,
      profile: {
        name,
        timezone,
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

    // Generate tokens
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN as string | number }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.JWT_REFRESH_EXPIRES_IN as string | number }
  );

  return { accessToken, refreshToken };
};
    // Find user
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Generate tokens
    const tokens = generateTokens(user.id);

    logger.info(`User logged in: ${email}`);

    res.json({
      user: {
        id: user.id,
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

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as any;
    
    if (decoded.type !== 'refresh') {
      throw new AppError(401, 'Invalid token type', 'INVALID_TOKEN');
    }

    // Generate new tokens
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
    // In a real application, you might want to:
    // 1. Add the token to a blacklist
    // 2. Clear any server-side sessions
    // 3. Log the logout event

    const userId = (req as any).userId;
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
    const userId = (req as any).userId;

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile,
      },
    });
  } catch (error) {
    next(error);
  }
};