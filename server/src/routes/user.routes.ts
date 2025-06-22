import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import * as userController from '../controllers/user.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get user profile
router.get('/profile', userController.getProfile);

// Update user profile
router.put(
  '/profile',
  [
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Name cannot be empty')
      .isLength({ max: 100 })
      .withMessage('Name is too long'),
    body('timezone')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Timezone cannot be empty')
      .custom((value) => {
        try {
          Intl.DateTimeFormat(undefined, { timeZone: value });
          return true;
        } catch (error) {
          return false;
        }
      })
      .withMessage('Invalid timezone'),
    body('avatarUrl')
      .optional()
      .isURL()
      .withMessage('Invalid avatar URL'),
  ],
  userController.updateProfile
);

// Update user preferences
router.put(
  '/preferences',
  [
    body('preferences')
      .isObject()
      .withMessage('Preferences must be an object'),
    body('preferences.notifications')
      .optional()
      .isObject()
      .withMessage('Notifications preferences must be an object'),
    body('preferences.theme')
      .optional()
      .isIn(['light', 'dark', 'system'])
      .withMessage('Invalid theme'),
    body('preferences.language')
      .optional()
      .isString()
      .withMessage('Language must be a string'),
  ],
  userController.updatePreferences
);

// Delete user account (GDPR compliance)
router.delete('/account', userController.deleteAccount);

// Get user's data export (GDPR compliance)
router.get('/export', async (req, res, next) => {
  // TODO: Implement data export
  res.status(501).json({
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Data export not yet implemented',
    },
  });
});

export default router;