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

// Protected routes (authentication required)
router.get('/me', authMiddleware, authController.getCurrentUser);

export default router;
