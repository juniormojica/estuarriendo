import { City, Department, Location } from '../models/index.js';

/**
 * City Controller
 * Handles CRUD operations for cities
 */

/**
 * Create new city (admin only)
 * POST /api/locations/cities
 */
export const createCity = async (req, res) => {
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
            return res.status(404).json({ error: 'Department not found' });
        }

        // Check if city with same slug and department already exists
        const existing = await City.findOne({
            where: { slug: slug.toLowerCase(), departmentId }
        });
        if (existing) {
            return res.status(409).json({
                error: 'City with this slug already exists in this department'
            });
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
        console.error('Error creating city:', error);
        res.status(500).json({
            error: 'Failed to create city',
            message: error.message
        });
    }
};

/**
 * Update city (admin only)
 * PUT /api/locations/cities/:id
 */
export const updateCity = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, departmentId, slug, isActive } = req.body;

        const city = await City.findByPk(id);
        if (!city) {
            return res.status(404).json({ error: 'City not found' });
        }

        // If department is being changed, verify it exists
        if (departmentId && departmentId !== city.departmentId) {
            const department = await Department.findByPk(departmentId);
            if (!department) {
                return res.status(404).json({ error: 'Department not found' });
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
                return res.status(409).json({
                    error: 'City with this slug already exists in this department'
                });
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
        console.error('Error updating city:', error);
        res.status(500).json({
            error: 'Failed to update city',
            message: error.message
        });
    }
};

/**
 * Delete city (admin only)
 * DELETE /api/locations/cities/:id
 */
export const deleteCity = async (req, res) => {
    try {
        const { id } = req.params;

        const city = await City.findByPk(id);
        if (!city) {
            return res.status(404).json({ error: 'City not found' });
        }

        // Check if city has associated locations (properties)
        const locationCount = await Location.count({ where: { cityId: id } });
        if (locationCount > 0) {
            return res.status(409).json({
                error: 'Cannot delete city with associated properties',
                message: `This city has ${locationCount} properties. Please delete or reassign them first.`
            });
        }

        await city.destroy();
        res.json({ message: 'City deleted successfully' });
    } catch (error) {
        console.error('Error deleting city:', error);

        // Handle foreign key constraint errors
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(409).json({
                error: 'Cannot delete city',
                message: 'This city is referenced by other records'
            });
        }

        res.status(500).json({
            error: 'Failed to delete city',
            message: error.message
        });
    }
};

export default {
    createCity,
    updateCity,
    deleteCity
};
