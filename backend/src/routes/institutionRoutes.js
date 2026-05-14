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
import { requireAdmin } from '../middleware/role.js';

const router = express.Router();

// Public read routes (catalog)
router.get('/', getAllInstitutions);
router.get('/search', searchInstitutions);
router.get('/:id', getInstitutionById);

// Admin CRUD
router.post('/', authMiddleware, requireAdmin, createInstitution);
router.put('/:id', authMiddleware, requireAdmin, updateInstitution);
router.delete('/:id', authMiddleware, requireAdmin, deleteInstitution);

export default router;
