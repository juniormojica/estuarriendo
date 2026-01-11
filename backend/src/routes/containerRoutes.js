import express from 'express';
import containerController from '../controllers/containerController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

/**
 * Container Routes
 * All routes require authentication
 */

// Container CRUD
router.post('/', authMiddleware, containerController.createContainer);
router.get('/:id', containerController.getContainer);
router.put('/:id', authMiddleware, containerController.updateContainer);
router.delete('/:id', authMiddleware, containerController.deleteContainer);

// Container actions
router.post('/:id/rent-complete', authMiddleware, containerController.rentCompleteContainer);
router.post('/:id/change-mode', authMiddleware, containerController.changeRentalMode);

// Unit management within container
router.post('/:containerId/units', authMiddleware, containerController.createUnit);
router.get('/:containerId/units', containerController.getContainerUnits);

export default router;
