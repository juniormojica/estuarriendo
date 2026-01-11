import express from 'express';
import containerController from '../controllers/containerController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * Unit Routes
 * Routes for individual unit management
 * All routes require authentication
 */

router.put('/:id', authenticate, containerController.updateUnit);
router.delete('/:id', authenticate, containerController.deleteUnit);
router.patch('/:id/rental-status', authenticate, containerController.updateUnitRentalStatus);

export default router;
