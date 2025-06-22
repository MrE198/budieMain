import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { TaskModel } from '../models/Task.model';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { io } from '../index';

export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).userId;
    const { status, priority, category, search, page = 1, limit = 20 } = req.query;

    const query: any = { userId };

    // Build query filters
    if (status) {
      query.status = { $in: (status as string).split(',') };
    }
    if (priority) {
      query.priority = { $in: (priority as string).split(',') };
    }
    if (category) {
      query.category = { $in: (category as string).split(',') };
    }
    if (search) {
      query.$text = { $search: search as string };
    }

    // Calculate pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const [tasks, total] = await Promise.all([
      TaskModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      TaskModel.countDocuments(query),
    ]);

    res.json({
      tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const task = await TaskModel.findOne({ _id: id, userId });
    if (!task) {
      throw new AppError(404, 'Task not found', 'TASK_NOT_FOUND');
    }

    res.json({ task });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (
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
    const taskData = {
      ...req.body,
      userId,
      createdBy: 'user',
    };

    const task = await TaskModel.create(taskData);

    // Emit real-time update
    io.to(`user:${userId}`).emit('task:created', { task });

    logger.info(`Task created: ${task.id} for user: ${userId}`);

    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
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
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.userId;
    delete updates.createdBy;

    const task = await TaskModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!task) {
      throw new AppError(404, 'Task not found', 'TASK_NOT_FOUND');
    }

    // Emit real-time update
    io.to(`user:${userId}`).emit('task:updated', { task });

    logger.info(`Task updated: ${task.id}`);

    res.json({ task });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const task = await TaskModel.findOneAndDelete({ _id: id, userId });

    if (!task) {
      throw new AppError(404, 'Task not found', 'TASK_NOT_FOUND');
    }

    // Emit real-time update
    io.to(`user:${userId}`).emit('task:deleted', { taskId: id });

    logger.info(`Task deleted: ${id}`);

    res.json({
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const completeTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const task = await TaskModel.findOneAndUpdate(
      { _id: id, userId },
      { 
        $set: { 
          status: 'completed',
          completedAt: new Date(),
        }
      },
      { new: true }
    );

    if (!task) {
      throw new AppError(404, 'Task not found', 'TASK_NOT_FOUND');
    }

    // Emit real-time update
    io.to(`user:${userId}`).emit('task:completed', { task });

    logger.info(`Task completed: ${task.id}`);

    res.json({ task });
  } catch (error) {
    next(error);
  }
};