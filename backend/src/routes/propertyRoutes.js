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

const router = express.Router();

// Property CRUD routes
router.get('/', getAllProperties);
router.get('/user/:userId', getUserProperties); // Get properties by owner
router.get('/:id', getPropertyById);
router.post('/', authMiddleware, createProperty);
router.put('/:id', authMiddleware, updateProperty);
router.delete('/:id', authMiddleware, deleteProperty);

// Property status management (admin)
router.put('/:id/approve', authMiddleware, approveProperty);
router.put('/:id/reject', authMiddleware, rejectProperty);

// Property features
router.put('/:id/toggle-featured', authMiddleware, toggleFeatured);
router.put('/:id/toggle-rented', authMiddleware, toggleRentedStatus);

export default router;
