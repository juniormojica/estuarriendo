import express from 'express';
import {
    getAllPropertyTypes,
    getPropertyTypeById,
    getPropertyTypeByName
} from '../controllers/propertyTypeController.js';

const router = express.Router();

// Property type routes
router.get('/', getAllPropertyTypes);
router.get('/:id', getPropertyTypeById);
router.get('/name/:name', getPropertyTypeByName);

export default router;
