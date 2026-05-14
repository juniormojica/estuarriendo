import express from 'express';
import {
    getAllAmenities,
    getAmenityById,
    createAmenity,
    updateAmenity,
    deleteAmenity
} from '../controllers/amenityController.js';
import authMiddleware from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';

const router = express.Router();

// Public read routes (catalog)
router.get('/', getAllAmenities);
router.get('/:id', getAmenityById);

// Admin CRUD
router.post('/', authMiddleware, requireAdmin, createAmenity);
router.put('/:id', authMiddleware, requireAdmin, updateAmenity);
router.delete('/:id', authMiddleware, requireAdmin, deleteAmenity);

export default router;
