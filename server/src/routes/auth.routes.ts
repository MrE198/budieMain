import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller';
import { authRateLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth';

const router = Router();

// Register
router.post(
  '/register',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('timezone').trim().notEmpty().withMessage('Timezone is required'),
  ],
  authController.register
);

// Login
router.post(
  '/login',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  authController.login
);

// Refresh token
router.post(
  '/refresh',
  [body('refreshToken').notEmpty()],
  authController.refreshToken
);

// Logout (requires authentication)
router.post('/logout', authenticate, authController.logout);

// Get current user (requires authentication)
router.get('/me', authenticate, authController.me);

export default router;