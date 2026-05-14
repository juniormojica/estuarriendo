import express from 'express';
import {
    getAllPropertyTypes,
    getPropertyTypeById,
    getPropertyTypeByName,
    createPropertyType,
    updatePropertyType,
    deletePropertyType
} from '../controllers/propertyTypeController.js';
import authMiddleware from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';

const router = express.Router();

// Public read routes (catalog)
router.get('/', getAllPropertyTypes);
router.get('/:id', getPropertyTypeById);
router.get('/name/:name', getPropertyTypeByName);

// Admin CRUD
router.post('/', authMiddleware, requireAdmin, createPropertyType);
router.put('/:id', authMiddleware, requireAdmin, updatePropertyType);
router.delete('/:id', authMiddleware, requireAdmin, deletePropertyType);

export default router;
