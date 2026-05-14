import express from 'express';
import {
    getAllCommonAreas,
    getCommonAreaById,
    createCommonArea,
    updateCommonArea,
    deleteCommonArea
} from '../controllers/commonAreaController.js';
import authMiddleware from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';

const router = express.Router();

// Public read routes (catalog)
router.get('/', getAllCommonAreas);
router.get('/:id', getCommonAreaById);

// Admin CRUD
router.post('/', authMiddleware, requireAdmin, createCommonArea);
router.put('/:id', authMiddleware, requireAdmin, updateCommonArea);
router.delete('/:id', authMiddleware, requireAdmin, deleteCommonArea);

export default router;
