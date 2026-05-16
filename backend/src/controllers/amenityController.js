import { Amenity, Property } from '../models/index.js';
import { badRequest, conflict, notFound } from '../errors/AppError.js';

/**
 * Amenity Controller
 * Handles amenity CRUD operations
 */

// Get all amenities
export const getAllAmenities = async (req, res, next) => {
    try {
        const amenities = await Amenity.findAll({
            order: [['name', 'ASC']]
        });
        res.json(amenities);
    } catch (error) {
        next(error);
    }
};

// Get amenity by ID
export const getAmenityById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const amenity = await Amenity.findByPk(id);

        if (!amenity) {
            throw notFound('Amenity not found', { code: 'AMENITY_NOT_FOUND' });
        }

        res.json(amenity);
    } catch (error) {
        next(error);
    }
};

// Create new amenity
export const createAmenity = async (req, res, next) => {
    try {
        const { name, icon } = req.body;

        if (!name) {
            throw badRequest('Amenity name is required', { code: 'AMENITY_NAME_REQUIRED' });
        }

        // Check if amenity already exists
        const existing = await Amenity.findOne({ where: { name } });
        if (existing) {
            throw conflict('Amenity already exists', { code: 'AMENITY_ALREADY_EXISTS' });
        }

        const amenity = await Amenity.create({ name, icon });
        res.status(201).json(amenity);
    } catch (error) {
        next(error);
    }
};

// Update amenity
export const updateAmenity = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, icon } = req.body;

        const amenity = await Amenity.findByPk(id);
        if (!amenity) {
            throw notFound('Amenity not found', { code: 'AMENITY_NOT_FOUND' });
        }

        await amenity.update({ name, icon });
        res.json(amenity);
    } catch (error) {
        next(error);
    }
};

// Delete amenity
export const deleteAmenity = async (req, res, next) => {
    try {
        const { id } = req.params;

        const amenity = await Amenity.findByPk(id);
        if (!amenity) {
            throw notFound('Amenity not found', { code: 'AMENITY_NOT_FOUND' });
        }

        await amenity.destroy();
        res.json({ message: 'Amenity deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export default {
    getAllAmenities,
    getAmenityById,
    createAmenity,
    updateAmenity,
    deleteAmenity
};
