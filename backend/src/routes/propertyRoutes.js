import express from 'express';
import {
    getAllProperties,
    getPropertyById,
    getUserProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    approveProperty,
    rejectProperty,
    toggleFeatured,
    toggleRentedStatus
} from '../controllers/propertyController.js';
import authMiddleware from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';

const router = express.Router();

// Property CRUD routes
router.get('/', getAllProperties);
router.get('/user/:userId', getUserProperties);
router.get('/:id', getPropertyById);
router.post('/', authMiddleware, createProperty);
router.put('/:id', authMiddleware, updateProperty);
router.delete('/:id', authMiddleware, deleteProperty);

// Property status management (admin)
router.put('/:id/approve', authMiddleware, requireAdmin, approveProperty);
router.put('/:id/reject', authMiddleware, requireAdmin, rejectProperty);

// Property features (admin)
router.put('/:id/toggle-featured', authMiddleware, requireAdmin, toggleFeatured);
router.put('/:id/toggle-rented', authMiddleware, requireAdmin, toggleRentedStatus);

export default router;
