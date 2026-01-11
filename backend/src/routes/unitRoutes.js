import express from 'express';
import containerController from '../controllers/containerController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

/**
 * Unit Routes
 * Routes for individual unit management
 * All routes require authentication
 */

router.put('/:id', authMiddleware, containerController.updateUnit);
router.delete('/:id', authMiddleware, containerController.deleteUnit);
router.patch('/:id/rental-status', authMiddleware, containerController.updateUnitRentalStatus);

export default router;
