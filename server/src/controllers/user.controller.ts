import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { UserModel } from '../models/User.model';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

export const getProfile = async (
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
      profile: user.profile,
      integrations: {
        google: !!user.integrations.google?.accessToken,
        microsoft: !!user.integrations.microsoft?.accessToken,
        whatsapp: !!user.integrations.whatsapp?.verified,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', { errors: errors.array() });
    }

    const userId = (req as any).userId;
    const updates = req.body;

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { 
        $set: {
          ...(updates.name && { 'profile.name': updates.name }),
          ...(updates.timezone && { 'profile.timezone': updates.timezone }),
          ...(updates.avatarUrl && { 'profile.avatarUrl': updates.avatarUrl }),
        }
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError(404, 'User not