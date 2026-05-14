import express from 'express';
import containerController from '../controllers/containerController.js';
import authMiddleware from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';

const router = express.Router();

/**
 * Unit Routes
 * Routes for individual unit management
 */

// Owner unit CRUD
router.put('/:id', authMiddleware, containerController.updateUnit);
router.delete('/:id', authMiddleware, containerController.deleteUnit);
router.patch('/:id/rental-status', authMiddleware, containerController.updateUnitRentalStatus);

// Unit approval/rejection (admin)
router.put('/:id/approve', authMiddleware, requireAdmin, containerController.approveUnit);
router.put('/:id/reject', authMiddleware, requireAdmin, containerController.rejectUnit);

export default router;
