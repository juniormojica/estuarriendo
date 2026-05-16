import { Department, City } from '../models/index.js';
import { Op } from 'sequelize';
import { badRequest, notFound } from '../errors/AppError.js';

/**
 * Location Controller
 * Handles department and city endpoints for autocomplete and filtering
 */

/**
 * Get all departments
 * GET /api/locations/departments
 */
export const getAllDepartments = async (req, res, next) => {
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
        next(error);
    }
};

/**
 * Get cities by department
 * GET /api/locations/cities?departmentId=1
 */
export const getCitiesByDepartment = async (req, res, next) => {
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
        next(error);
    }
};

/**
 * Search cities by name (autocomplete)
 * GET /api/locations/cities/search?q=bog&departmentId=1
 */
export const searchCities = async (req, res, next) => {
    try {
        const { q, departmentId, limit = 10 } = req.query;

        if (!q || q.length < 2) {
            return next(badRequest('Query parameter "q" must be at least 2 characters', {
                code: 'CITY_SEARCH_QUERY_TOO_SHORT'
            }));
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
        next(error);
    }
};

/**
 * Get city by ID
 * GET /api/locations/cities/:id
 */
export const getCityById = async (req, res, next) => {
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
            return next(notFound('City not found', { code: 'CITY_NOT_FOUND' }));
        }

        res.json(city);
    } catch (error) {
        next(error);
    }
};

export default {
    getAllDepartments,
    getCitiesByDepartment,
    searchCities,
    getCityById
};
