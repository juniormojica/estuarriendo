import { Department, City } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Location Controller
 * Handles department and city endpoints for autocomplete and filtering
 */

/**
 * Get all departments
 * GET /api/locations/departments
 */
export const getAllDepartments = async (req, res) => {
    try {
        const { isActive } = req.query;

        const where = {};
        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }

        const departments = await Department.findAll({
            where,
            order: [['name', 'ASC']],
            attributes: ['id', 'name', 'code', 'slug', 'isActive']
        });

        res.json(departments);
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({
            error: 'Failed to fetch departments',
            message: error.message
        });
    }
};

/**
 * Get cities by department
 * GET /api/locations/cities?departmentId=1
 */
export const getCitiesByDepartment = async (req, res) => {
    try {
        const { departmentId, isActive } = req.query;

        const where = {};
        if (departmentId) {
            where.departmentId = departmentId;
        }
        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }

        const cities = await City.findAll({
            where,
            include: [
                {
                    model: Department,
                    as: 'department',
                    attributes: ['id', 'name', 'code']
                }
            ],
            order: [['name', 'ASC']],
            attributes: ['id', 'name', 'slug', 'departmentId', 'isActive']
        });

        res.json(cities);
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({
            error: 'Failed to fetch cities',
            message: error.message
        });
    }
};

/**
 * Search cities by name (autocomplete)
 * GET /api/locations/cities/search?q=bog&departmentId=1
 */
export const searchCities = async (req, res) => {
    try {
        const { q, departmentId, limit = 10 } = req.query;

        if (!q || q.length < 2) {
            return res.status(400).json({
                error: 'Query parameter "q" must be at least 2 characters'
            });
        }

        const where = {
            name: {
                [Op.iLike]: `%${q}%`
            },
            isActive: true
        };

        if (departmentId) {
            where.departmentId = departmentId;
        }

        const cities = await City.findAll({
            where,
            include: [
                {
                    model: Department,
                    as: 'department',
                    attributes: ['id', 'name', 'code']
                }
            ],
            limit: parseInt(limit),
            order: [['name', 'ASC']],
            attributes: ['id', 'name', 'slug', 'departmentId']
        });

        res.json(cities);
    } catch (error) {
        console.error('Error searching cities:', error);
        res.status(500).json({
            error: 'Failed to search cities',
            message: error.message
        });
    }
};

/**
 * Get city by ID
 * GET /api/locations/cities/:id
 */
export const getCityById = async (req, res) => {
    try {
        const { id } = req.params;

        const city = await City.findByPk(id, {
            include: [
                {
                    model: Department,
                    as: 'department',
                    attributes: ['id', 'name', 'code', 'slug']
                }
            ]
        });

        if (!city) {
            return res.status(404).json({ error: 'City not found' });
        }

        res.json(city);
    } catch (error) {
        console.error('Error fetching city:', error);
        res.status(500).json({
            error: 'Failed to fetch city',
            message: error.message
        });
    }
};

export default {
    getAllDepartments,
    getCitiesByDepartment,
    searchCities,
    getCityById
};
