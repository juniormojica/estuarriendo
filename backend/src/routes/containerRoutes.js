import express from 'express';
import containerController from '../controllers/containerController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

/**
 * Container Routes
 * All routes require authentication
 */

import { requireAdmin } from '../middleware/role.js';

// Container CRUD
router.get('/pending', authMiddleware, requireAdmin, containerController.getPendingContainers);
router.post('/admin-create', authMiddleware, requireAdmin, containerController.adminCreateContainer);
router.post('/', authMiddleware, containerController.createContainer);
router.get('/:id', containerController.getContainer);
router.put('/:id', authMiddleware, containerController.updateContainer);
router.delete('/:id', authMiddleware, containerController.deleteContainer);

// Container actions
router.post('/:id/rent-complete', authMiddleware, containerController.rentCompleteContainer);
router.post('/:id/change-mode', authMiddleware, containerController.changeRentalMode);

// Container approval (admin)
router.put('/:id/approve', authMiddleware, requireAdmin, containerController.approveContainer);

// Unit management within container
router.post('/:containerId/units', authMiddleware, containerController.createUnit);
router.get('/:containerId/units', containerController.getContainerUnits);

export default router;
