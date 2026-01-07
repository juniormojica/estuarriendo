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

const router = express.Router();

// Property type routes
router.get('/', getAllPropertyTypes);
router.get('/:id', getPropertyTypeById);
router.get('/name/:name', getPropertyTypeByName);

// Create property type (admin only)
router.post('/', authMiddleware, createPropertyType);

// Update property type (admin only)
router.put('/:id', authMiddleware, updatePropertyType);

// Delete property type (admin only)
router.delete('/:id', authMiddleware, deletePropertyType);

export default router;
