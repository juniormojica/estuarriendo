import express from 'express';
import {
    getAllDepartments,
    getCitiesByDepartment,
    searchCities,
    getCityById
} from '../controllers/locationController.js';
import {
    createDepartment,
    updateDepartment,
    deleteDepartment
} from '../controllers/departmentController.js';
import {
    createCity,
    updateCity,
    deleteCity
} from '../controllers/cityController.js';
import authMiddleware from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';

const router = express.Router();

// Public read routes (catalog)
router.get('/departments', getAllDepartments);
router.get('/cities', getCitiesByDepartment);
router.get('/cities/search', searchCities);
router.get('/cities/:id', getCityById);

// Admin CRUD: departments
router.post('/departments', authMiddleware, requireAdmin, createDepartment);
router.put('/departments/:id', authMiddleware, requireAdmin, updateDepartment);
router.delete('/departments/:id', authMiddleware, requireAdmin, deleteDepartment);

// Admin CRUD: cities
router.post('/cities', authMiddleware, requireAdmin, createCity);
router.put('/cities/:id', authMiddleware, requireAdmin, updateCity);
router.delete('/cities/:id', authMiddleware, requireAdmin, deleteCity);

export default router;
