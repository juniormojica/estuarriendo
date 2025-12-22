import express from 'express';
import {
    getAllAmenities,
    getAmenityById,
    createAmenity,
    updateAmenity,
    deleteAmenity
} from '../controllers/amenityController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Amenity CRUD routes
router.get('/', getAllAmenities);
router.get('/:id', getAmenityById);

// Create amenity (admin only)
router.post('/', authMiddleware, createAmenity);

// Update amenity (admin only)
router.put('/:id', authMiddleware, updateAmenity);

// Delete amenity (admin only)
router.delete('/:id', authMiddleware, deleteAmenity);

export default router;
