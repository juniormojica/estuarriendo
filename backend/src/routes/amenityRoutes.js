import express from 'express';
import {
    getAllAmenities,
    getAmenityById,
    createAmenity,
    updateAmenity,
    deleteAmenity
} from '../controllers/amenityController.js';

const router = express.Router();

// Amenity CRUD routes
router.get('/', getAllAmenities);
router.get('/:id', getAmenityById);
router.post('/', createAmenity);
router.put('/:id', updateAmenity);
router.delete('/:id', deleteAmenity);

export default router;
