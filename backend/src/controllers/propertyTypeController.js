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
