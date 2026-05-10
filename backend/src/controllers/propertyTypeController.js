import { PropertyType } from '../models/index.js';
import { conflict, notFound } from '../errors/AppError.js';

/**
 * Property Type Controller
 * Handles requests for property type reference data
 */

/**
 * Get all property types
 * @route GET /api/property-types
 */
export const getAllPropertyTypes = async (req, res, next) => {
    try {
        const propertyTypes = await PropertyType.findAll({
            attributes: ['id', 'name', 'description'],
            order: [['name', 'ASC']]
        });

        res.json(propertyTypes);
    } catch (error) {
        next(error);
    }
};

/**
 * Get property type by ID
 * @route GET /api/property-types/:id
 */
export const getPropertyTypeById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const propertyType = await PropertyType.findByPk(id);

        if (!propertyType) {
            throw notFound('Property type not found', { code: 'PROPERTY_TYPE_NOT_FOUND' });
        }

        res.json(propertyType);
    } catch (error) {
        next(error);
    }
};

/**
 * Get property type by name
 * @route GET /api/property-types/name/:name
 */
export const getPropertyTypeByName = async (req, res, next) => {
    try {
        const { name } = req.params;
        const propertyType = await PropertyType.findOne({
            where: { name }
        });

        if (!propertyType) {
            throw notFound('Property type not found', { code: 'PROPERTY_TYPE_NOT_FOUND' });
        }

        res.json(propertyType);
    } catch (error) {
        next(error);
    }
};

/**
 * Create new property type (admin only)
 * @route POST /api/property-types
 */
export const createPropertyType = async (req, res, next) => {
    try {
        const { name, description } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({
                error: 'Property type name is required'
            });
        }

        // Check if property type already exists
        const existing = await PropertyType.findOne({ where: { name } });
        if (existing) {
            return res.status(409).json({
                error: 'Property type with this name already exists'
            });
        }

        const propertyType = await PropertyType.create({
            name,
            description,
            createdAt: new Date()
        });

        res.status(201).json(propertyType);
    } catch (error) {
        next(error);
    }
};

/**
 * Update property type (admin only)
 * @route PUT /api/property-types/:id
 */
export const updatePropertyType = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const propertyType = await PropertyType.findByPk(id);
        if (!propertyType) {
            throw notFound('Property type not found', { code: 'PROPERTY_TYPE_NOT_FOUND' });
        }

        // Check if name is being changed and if new name already exists
        if (name && name !== propertyType.name) {
            const existing = await PropertyType.findOne({ where: { name } });
            if (existing) {
                return res.status(409).json({
                    error: 'Property type with this name already exists'
                });
            }
        }

        await propertyType.update({
            name: name || propertyType.name,
            description: description !== undefined ? description : propertyType.description,
            updatedAt: new Date()
        });

        res.json(propertyType);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete property type (admin only)
 * @route DELETE /api/property-types/:id
 */
export const deletePropertyType = async (req, res, next) => {
    try {
        const { id } = req.params;

        const propertyType = await PropertyType.findByPk(id);
        if (!propertyType) {
            throw notFound('Property type not found', { code: 'PROPERTY_TYPE_NOT_FOUND' });
        }

        await propertyType.destroy();
        res.json({ message: 'Property type deleted successfully' });
    } catch (error) {
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return next(conflict('Cannot delete property type', { code: 'PROPERTY_TYPE_IN_USE' }));
        }

        next(error);
    }
};

export default {
    getAllPropertyTypes,
    getPropertyTypeById,
    getPropertyTypeByName,
    createPropertyType,
    updatePropertyType,
    deletePropertyType
};
