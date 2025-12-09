import express from 'express';
import * as authController from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

/**
 * Authentication Routes
 * All routes are prefixed with /api/auth
 */

// Public routes (no authentication required)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Password reset routes (public)
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password/:token', authController.verifyResetToken);
router.post('/reset-password', authController.resetPassword);

// Protected routes (authentication required)
router.get('/me', authMiddleware, authController.getCurrentUser);

export default router;
