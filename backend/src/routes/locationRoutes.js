import express from 'express';
import {
    getAllDepartments,
    getCitiesByDepartment,
    searchCities,
    getCityById
} from '../controllers/locationController.js';

const router = express.Router();

// Get all departments
router.get('/departments', getAllDepartments);

// Get cities (optionally filtered by department)
router.get('/cities', getCitiesByDepartment);

// Search cities (autocomplete)
router.get('/cities/search', searchCities);

// Get city by ID
router.get('/cities/:id', getCityById);

export default router;
