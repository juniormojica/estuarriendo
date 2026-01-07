import express from 'express';
import {
    getAllInstitutions,
    searchInstitutions,
    getInstitutionById,
    createInstitution,
    updateInstitution,
    deleteInstitution
} from '../controllers/institutionController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Get all institutions (filtered by city/type)
router.get('/', getAllInstitutions);

// Search institutions (autocomplete)
router.get('/search', searchInstitutions);

// Get institution by ID
router.get('/:id', getInstitutionById);

// Create new institution (admin only)
router.post('/', authMiddleware, createInstitution);

// Update institution (admin only)
router.put('/:id', authMiddleware, updateInstitution);

// Delete institution (admin only)
router.delete('/:id', authMiddleware, deleteInstitution);

export default router;
