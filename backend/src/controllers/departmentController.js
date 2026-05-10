import { Department, City } from '../models/index.js';
import { conflict, notFound } from '../errors/AppError.js';

/**
 * Department Controller
 * Handles CRUD operations for departments
 */

/**
 * Create new department (admin only)
 * POST /api/locations/departments
 */
export const createDepartment = async (req, res) => {
    try {
        const { name, code, slug, isActive = true } = req.body;

        // Validate required fields
        if (!name || !code || !slug) {
            return res.status(400).json({
                error: 'Missing required fields: name, code, slug'
            });
        }

        // Check if department with same code already exists
        const existingCode = await Department.findOne({ where: { code } });
        if (existingCode) {
            return res.status(409).json({
                error: 'Department with this code already exists'
            });
        }

        // Check if department with same slug already exists
        const existingSlug = await Department.findOne({ where: { slug } });
        if (existingSlug) {
            return res.status(409).json({
                error: 'Department with this slug already exists'
            });
        }

        const department = await Department.create({
            name,
            code: code.toUpperCase(),
            slug: slug.toLowerCase(),
            isActive,
            createdAt: new Date()
        });

        res.status(201).json(department);
    } catch (error) {
        console.error('Error creating department:', error);
        res.status(500).json({
            error: 'Failed to create department',
            message: error.message
        });
    }
};

/**
 * Update department (admin only)
 * PUT /api/locations/departments/:id
 */
export const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, slug, isActive } = req.body;

        const department = await Department.findByPk(id);
        if (!department) {
            return res.status(404).json({ error: 'Department not found' });
        }

        // Check if code is being changed and if new code already exists
        if (code && code !== department.code) {
            const existingCode = await Department.findOne({
                where: { code: code.toUpperCase() }
            });
            if (existingCode) {
                return res.status(409).json({
                    error: 'Department with this code already exists'
                });
            }
        }

        // Check if slug is being changed and if new slug already exists
        if (slug && slug !== department.slug) {
            const existingSlug = await Department.findOne({
                where: { slug: slug.toLowerCase() }
            });
            if (existingSlug) {
                return res.status(409).json({
                    error: 'Department with this slug already exists'
                });
            }
        }

        await department.update({
            name: name || department.name,
            code: code ? code.toUpperCase() : department.code,
            slug: slug ? slug.toLowerCase() : department.slug,
            isActive: isActive !== undefined ? isActive : department.isActive,
            updatedAt: new Date()
        });

        res.json(department);
    } catch (error) {
        console.error('Error updating department:', error);
        res.status(500).json({
            error: 'Failed to update department',
            message: error.message
        });
    }
};

/**
 * Delete department (admin only)
 * DELETE /api/locations/departments/:id
 */
export const deleteDepartment = async (req, res, next) => {
    try {
        const { id } = req.params;

        const department = await Department.findByPk(id);
        if (!department) {
            return next(notFound('Department not found', { code: 'DEPARTMENT_NOT_FOUND' }));
        }

        // Check if department has associated cities
        const cityCount = await City.count({ where: { departmentId: id } });
        if (cityCount > 0) {
            return next(conflict('Cannot delete department with associated cities', {
                code: 'DEPARTMENT_HAS_CITIES',
                details: {
                    cityCount
                }
            }));
        }

        await department.destroy();
        res.json({ message: 'Department deleted successfully' });
    } catch (error) {
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return next(conflict('Cannot delete department', { code: 'DEPARTMENT_IN_USE' }));
        }

        next(error);
    }
};

export default {
    createDepartment,
    updateDepartment,
    deleteDepartment
};
