import { City, Department, Location } from '../models/index.js';
import { conflict, notFound } from '../errors/AppError.js';

/**
 * City Controller
 * Handles CRUD operations for cities
 */

/**
 * Create new city (admin only)
 * POST /api/locations/cities
 */
export const createCity = async (req, res, next) => {
    try {
        const { name, departmentId, slug, isActive = true } = req.body;

        // Validate required fields
        if (!name || !departmentId || !slug) {
            return res.status(400).json({
                error: 'Missing required fields: name, departmentId, slug'
            });
        }

        // Check if department exists
        const department = await Department.findByPk(departmentId);
        if (!department) {
            return next(notFound('Department not found', { code: 'DEPARTMENT_NOT_FOUND' }));
        }

        // Check if city with same slug and department already exists
        const existing = await City.findOne({
            where: { slug: slug.toLowerCase(), departmentId }
        });
        if (existing) {
            return next(conflict('City with this slug already exists in this department', {
                code: 'CITY_SLUG_EXISTS'
            }));
        }

        const city = await City.create({
            name,
            departmentId,
            slug: slug.toLowerCase(),
            isActive,
            createdAt: new Date()
        });

        // Fetch with department association
        const created = await City.findByPk(city.id, {
            include: [
                {
                    model: Department,
                    as: 'department',
                    attributes: ['id', 'name', 'code', 'slug']
                }
            ]
        });

        res.status(201).json(created);
    } catch (error) {
        next(error);
    }
};

/**
 * Update city (admin only)
 * PUT /api/locations/cities/:id
 */
export const updateCity = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, departmentId, slug, isActive } = req.body;

        const city = await City.findByPk(id);
        if (!city) {
            return next(notFound('City not found', { code: 'CITY_NOT_FOUND' }));
        }

        // If department is being changed, verify it exists
        if (departmentId && departmentId !== city.departmentId) {
            const department = await Department.findByPk(departmentId);
            if (!department) {
                return next(notFound('Department not found', { code: 'DEPARTMENT_NOT_FOUND' }));
            }
        }

        // Check if slug is being changed and if new slug already exists in the department
        const targetDepartmentId = departmentId || city.departmentId;
        if (slug && (slug !== city.slug || departmentId !== city.departmentId)) {
            const existing = await City.findOne({
                where: {
                    slug: slug.toLowerCase(),
                    departmentId: targetDepartmentId
                }
            });
            if (existing && existing.id !== parseInt(id)) {
                return next(conflict('City with this slug already exists in this department', {
                    code: 'CITY_SLUG_EXISTS'
                }));
            }
        }

        await city.update({
            name: name || city.name,
            departmentId: departmentId || city.departmentId,
            slug: slug ? slug.toLowerCase() : city.slug,
            isActive: isActive !== undefined ? isActive : city.isActive,
            updatedAt: new Date()
        });

        // Fetch with department association
        const updated = await City.findByPk(id, {
            include: [
                {
                    model: Department,
                    as: 'department',
                    attributes: ['id', 'name', 'code', 'slug']
                }
            ]
        });

        res.json(updated);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete city (admin only)
 * DELETE /api/locations/cities/:id
 */
export const deleteCity = async (req, res, next) => {
    try {
        const { id } = req.params;

        const city = await City.findByPk(id);
        if (!city) {
            return next(notFound('City not found', { code: 'CITY_NOT_FOUND' }));
        }

        // Check if city has associated locations (properties)
        const locationCount = await Location.count({ where: { cityId: id } });
        if (locationCount > 0) {
            return next(conflict('Cannot delete city with associated properties', {
                code: 'CITY_HAS_PROPERTIES',
                details: {
                    locationCount
                }
            }));
        }

        await city.destroy();
        res.json({ message: 'City deleted successfully' });
    } catch (error) {
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return next(conflict('Cannot delete city', { code: 'CITY_IN_USE' }));
        }

        next(error);
    }
};

export default {
    createCity,
    updateCity,
    deleteCity
};
