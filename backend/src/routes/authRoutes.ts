import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/authController';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

// Register a new user
router.post(
  '/register',
  validate([
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ]),
  AuthController.register
);

// Login
router.post(
  '/login',
  validate([
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  AuthController.login
);

// Validate token
router.get('/validate', authenticate, AuthController.validateToken);

export default router;

