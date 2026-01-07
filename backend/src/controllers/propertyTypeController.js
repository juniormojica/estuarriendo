import { PropertyType } from '../models/index.js';

/**
 * Property Type Controller
 * Handles requests for property type reference data
 */

/**
 * Get all property types
 * @route GET /api/property-types
 */
export const getAllPropertyTypes = async (req, res) => {
    try {
        const propertyTypes = await PropertyType.findAll({
            attributes: ['id', 'name', 'description'],
            order: [['name', 'ASC']]
        });

        res.json(propertyTypes);
    } catch (error) {
        console.error('Error fetching property types:', error);
        res.status(500).json({
            error: 'Error al obtener los tipos de propiedad',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get property type by ID
 * @route GET /api/property-types/:id
 */
export const getPropertyTypeById = async (req, res) => {
    try {
        const { id } = req.params;
        const propertyType = await PropertyType.findByPk(id);

        if (!propertyType) {
            return res.status(404).json({
                error: 'Tipo de propiedad no encontrado'
            });
        }

        res.json(propertyType);
    } catch (error) {
        console.error('Error fetching property type:', error);
        res.status(500).json({
            error: 'Error al obtener el tipo de propiedad',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get property type by name
 * @route GET /api/property-types/name/:name
 */
export const getPropertyTypeByName = async (req, res) => {
    try {
        const { name } = req.params;
        const propertyType = await PropertyType.findOne({
            where: { name }
        });

        if (!propertyType) {
            return res.status(404).json({
                error: 'Tipo de propiedad no encontrado'
            });
        }

        res.json(propertyType);
    } catch (error) {
        console.error('Error fetching property type by name:', error);
        res.status(500).json({
            error: 'Error al obtener el tipo de propiedad',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Create new property type (admin only)
 * @route POST /api/property-types
 */
export const createPropertyType = async (req, res) => {
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
        console.error('Error creating property type:', error);
        res.status(500).json({
            error: 'Failed to create property type',
            message: error.message
        });
    }
};

/**
 * Update property type (admin only)
 * @route PUT /api/property-types/:id
 */
export const updatePropertyType = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const propertyType = await PropertyType.findByPk(id);
        if (!propertyType) {
            return res.status(404).json({
                error: 'Property type not found'
            });
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
        console.error('Error updating property type:', error);
        res.status(500).json({
            error: 'Failed to update property type',
            message: error.message
        });
    }
};

/**
 * Delete property type (admin only)
 * @route DELETE /api/property-types/:id
 */
export const deletePropertyType = async (req, res) => {
    try {
        const { id } = req.params;

        const propertyType = await PropertyType.findByPk(id);
        if (!propertyType) {
            return res.status(404).json({
                error: 'Property type not found'
            });
        }

        await propertyType.destroy();
        res.json({ message: 'Property type deleted successfully' });
    } catch (error) {
        console.error('Error deleting property type:', error);

        // Handle foreign key constraint errors
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(409).json({
                error: 'Cannot delete property type',
                message: 'This property type is used by existing properties'
            });
        }

        res.status(500).json({
            error: 'Failed to delete property type',
            message: error.message
        });
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
