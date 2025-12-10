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

const router = express.Router();

// Property CRUD routes
router.get('/', getAllProperties);
router.get('/user/:userId', getUserProperties); // Get properties by owner
router.get('/:id', getPropertyById);
router.post('/', createProperty);
router.put('/:id', updateProperty);
router.delete('/:id', deleteProperty);

// Property status management (admin)
router.put('/:id/approve', approveProperty);
router.put('/:id/reject', rejectProperty);

// Property features
router.put('/:id/toggle-featured', toggleFeatured);
router.put('/:id/toggle-rented', toggleRentedStatus);

export default router;
