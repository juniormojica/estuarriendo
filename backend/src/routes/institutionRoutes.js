import express from 'express';
import {
    getAllInstitutions,
    searchInstitutions,
    getInstitutionById,
    createInstitution
} from '../controllers/institutionController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Get all institutions (filtered by city/type)
router.get('/', getAllInstitutions);

// Search institutions (autocomplete)
router.get('/search', searchInstitutions);

// Get institution by ID
router.get('/:id', getInstitutionById);

// Create new institution (admin only - will add admin middleware later)
router.post('/', authMiddleware, createInstitution);

export default router;
