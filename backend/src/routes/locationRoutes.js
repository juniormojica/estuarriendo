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

const router = express.Router();

// Department routes
// Get all departments
router.get('/departments', getAllDepartments);

// Create department (admin only)
router.post('/departments', authMiddleware, createDepartment);

// Update department (admin only)
router.put('/departments/:id', authMiddleware, updateDepartment);

// Delete department (admin only)
router.delete('/departments/:id', authMiddleware, deleteDepartment);

// City routes
// Get cities (optionally filtered by department)
router.get('/cities', getCitiesByDepartment);

// Search cities (autocomplete)
router.get('/cities/search', searchCities);

// Get city by ID
router.get('/cities/:id', getCityById);

// Create city (admin only)
router.post('/cities', authMiddleware, createCity);

// Update city (admin only)
router.put('/cities/:id', authMiddleware, updateCity);

// Delete city (admin only)
router.delete('/cities/:id', authMiddleware, deleteCity);

export default router;
