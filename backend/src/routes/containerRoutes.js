import express from 'express';
import containerController from '../controllers/containerController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * Container Routes
 * All routes require authentication
 */

// Container CRUD
router.post('/', authenticate, containerController.createContainer);
router.get('/:id', containerController.getContainer);
router.put('/:id', authenticate, containerController.updateContainer);
router.delete('/:id', authenticate, containerController.deleteContainer);

// Container actions
router.post('/:id/rent-complete', authenticate, containerController.rentCompleteContainer);
router.post('/:id/change-mode', authenticate, containerController.changeRentalMode);

// Unit management within container
router.post('/:containerId/units', authenticate, containerController.createUnit);
router.get('/:containerId/units', containerController.getContainerUnits);

export default router;
