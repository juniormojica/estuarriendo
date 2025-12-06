import { Amenity, Property } from '../models/index.js';

/**
 * Amenity Controller
 * Handles amenity CRUD operations
 */

// Get all amenities
export const getAllAmenities = async (req, res) => {
    try {
        const amenities = await Amenity.findAll({
            order: [['name', 'ASC']]
        });
        res.json(amenities);
    } catch (error) {
        console.error('Error fetching amenities:', error);
        res.status(500).json({ error: 'Failed to fetch amenities', message: error.message });
    }
};

// Get amenity by ID
export const getAmenityById = async (req, res) => {
    try {
        const { id } = req.params;
        const amenity = await Amenity.findByPk(id);

        if (!amenity) {
            return res.status(404).json({ error: 'Amenity not found' });
        }

        res.json(amenity);
    } catch (error) {
        console.error('Error fetching amenity:', error);
        res.status(500).json({ error: 'Failed to fetch amenity', message: error.message });
    }
};

// Create new amenity
export const createAmenity = async (req, res) => {
    try {
        const { name, icon } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Amenity name is required' });
        }

        // Check if amenity already exists
        const existing = await Amenity.findOne({ where: { name } });
        if (existing) {
            return res.status(409).json({ error: 'Amenity already exists' });
        }

        const amenity = await Amenity.create({ name, icon });
        res.status(201).json(amenity);
    } catch (error) {
        console.error('Error creating amenity:', error);
        res.status(500).json({ error: 'Failed to create amenity', message: error.message });
    }
};

// Update amenity
export const updateAmenity = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, icon } = req.body;

        const amenity = await Amenity.findByPk(id);
        if (!amenity) {
            return res.status(404).json({ error: 'Amenity not found' });
        }

        await amenity.update({ name, icon });
        res.json(amenity);
    } catch (error) {
        console.error('Error updating amenity:', error);
        res.status(500).json({ error: 'Failed to update amenity', message: error.message });
    }
};

// Delete amenity
export const deleteAmenity = async (req, res) => {
    try {
        const { id } = req.params;

        const amenity = await Amenity.findByPk(id);
        if (!amenity) {
            return res.status(404).json({ error: 'Amenity not found' });
        }

        await amenity.destroy();
        res.json({ message: 'Amenity deleted successfully' });
    } catch (error) {
        console.error('Error deleting amenity:', error);
        res.status(500).json({ error: 'Failed to delete amenity', message: error.message });
    }
};

export default {
    getAllAmenities,
    getAmenityById,
    createAmenity,
    updateAmenity,
    deleteAmenity
};
