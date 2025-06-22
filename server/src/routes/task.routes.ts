import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { authenticate } from '../middleware/auth';
import * as taskController from '../controllers/task.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all tasks with filtering and pagination
router.get(
  '/',
  [
    query('status')
      .optional()
      .isString()
      .withMessage('Status must be a string'),
    query('priority')
      .optional()
      .isString()
      .withMessage('Priority must be a string'),
    query('category')
      .optional()
      .isString()
      .withMessage('Category must be a string'),
    query('search')
      .optional()
      .isString()
      .withMessage('Search must be a string'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],
  taskController.getTasks
);

// Get single task
router.get(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid task ID'),
  ],
  taskController.getTask
);

// Create new task
router.post(
  '/',
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 200 })
      .withMessage('Title is too long'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Description is too long'),
    body('priority')
      .isIn(['urgent', 'high', 'medium', 'low'])
      .withMessage('Invalid priority'),
    body('category')
      .isIn(['work', 'personal', 'family'])
      .withMessage('Invalid category'),
    body('status')
      .optional()
      .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
      .withMessage('Invalid status'),
    body('dueDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format'),
    body('linkedEvents')
      .optional()
      .isArray()
      .withMessage('Linked events must be an array'),
    body('subtasks')
      .optional()
      .isArray()
      .withMessage('Subtasks must be an array'),
    body('subtasks.*.title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Subtask title cannot be empty'),
  ],
  taskController.createTask
);

// Update task
router.put(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid task ID'),
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Title cannot be empty')
      .isLength({ max: 200 })
      .withMessage('Title is too long'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Description is too long'),
    body('priority')
      .optional()
      .isIn(['urgent', 'high', 'medium', 'low'])
      .withMessage('Invalid priority'),
    body('category')
      .optional()
      .isIn(['work', 'personal', 'family'])
      .withMessage('Invalid category'),
    body('status')
      .optional()
      .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
      .withMessage('Invalid status'),
    body('dueDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format'),
  ],
  taskController.updateTask
);

// Complete task (convenience endpoint)
router.post(
  '/:id/complete',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid task ID'),
  ],
  taskController.completeTask
);

// Delete task
router.delete(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid task ID'),
  ],
  taskController.deleteTask
);

export default router;