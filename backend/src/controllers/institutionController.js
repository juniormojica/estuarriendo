import { Institution, City, Department } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Institution Controller
 * Handles institution endpoints for autocomplete and filtering
 */

/**
 * Get all institutions
 * GET /api/institutions?cityId=1&type=universidad
 */
export const getAllInstitutions = async (req, res) => {
    try {
        const { cityId, type, limit = 50 } = req.query;

        const where = {};
        if (cityId) {
            where.cityId = cityId;
        }
        if (type) {
            where.type = type;
        }

        const institutions = await Institution.findAll({
            where,
            include: [
                {
                    model: City,
                    as: 'city',
                    attributes: ['id', 'name', 'slug'],
                    include: [
                        {
                            model: Department,
                            as: 'department',
                            attributes: ['id', 'name', 'code']
                        }
                    ]
                }
            ],
            limit: parseInt(limit),
            order: [['name', 'ASC']],
            attributes: ['id', 'name', 'cityId', 'type']
        });

        res.json(institutions);
    } catch (error) {
        console.error('Error fetching institutions:', error);
        res.status(500).json({
            error: 'Failed to fetch institutions',
            message: error.message
        });
    }
};

/**
 * Search institutions by name (autocomplete)
 * GET /api/institutions/search?q=nacional&cityId=1&type=universidad
 */
export const searchInstitutions = async (req, res) => {
    try {
        const { q, cityId, type, limit = 10 } = req.query;

        if (!q || q.length < 2) {
            return res.status(400).json({
                error: 'Query parameter "q" must be at least 2 characters'
            });
        }

        const where = {
            [Op.or]: [
                {
                    name: {
                        [Op.iLike]: `%${q}%`
                    }
                },
                {
                    acronym: {
                        [Op.iLike]: `%${q}%`
                    }
                }
            ]
        };

        if (cityId) {
            where.cityId = cityId;
        }
        if (type) {
            where.type = type;
        }

        const institutions = await Institution.findAll({
            where,
            include: [
                {
                    model: City,
                    as: 'city',
                    attributes: ['id', 'name', 'slug'],
                    include: [
                        {
                            model: Department,
                            as: 'department',
                            attributes: ['id', 'name', 'code']
                        }
                    ]
                }
            ],
            limit: parseInt(limit),
            order: [['name', 'ASC']],
            attributes: ['id', 'name', 'acronym', 'cityId', 'type']
        });

        res.json(institutions);
    } catch (error) {
        console.error('Error searching institutions:', error);
        res.status(500).json({
            error: 'Failed to search institutions',
            message: error.message
        });
    }
};

/**
 * Get institution by ID
 * GET /api/institutions/:id
 */
export const getInstitutionById = async (req, res) => {
    try {
        const { id } = req.params;

        const institution = await Institution.findByPk(id, {
            include: [
                {
                    model: City,
                    as: 'city',
                    attributes: ['id', 'name', 'slug'],
                    include: [
                        {
                            model: Department,
                            as: 'department',
                            attributes: ['id', 'name', 'code', 'slug']
                        }
                    ]
                }
            ]
        });

        if (!institution) {
            return res.status(404).json({ error: 'Institution not found' });
        }

        res.json(institution);
    } catch (error) {
        console.error('Error fetching institution:', error);
        res.status(500).json({
            error: 'Failed to fetch institution',
            message: error.message
        });
    }
};

/**
 * Create new institution (admin only)
 * POST /api/institutions
 */
export const createInstitution = async (req, res) => {
    try {
        const { name, cityId, type } = req.body;

        // Validate required fields
        if (!name || !cityId || !type) {
            return res.status(400).json({
                error: 'Missing required fields: name, cityId, type'
            });
        }

        // Check if city exists
        const city = await City.findByPk(cityId);
        if (!city) {
            return res.status(404).json({ error: 'City not found' });
        }

        // Check if institution already exists
        const existing = await Institution.findOne({
            where: { name, cityId }
        });

        if (existing) {
            return res.status(400).json({
                error: 'Institution with this name already exists in this city'
            });
        }

        const institution = await Institution.create({
            name,
            cityId,
            type,
            createdAt: new Date()
        });

        // Fetch with associations
        const created = await Institution.findByPk(institution.id, {
            include: [
                {
                    model: City,
                    as: 'city',
                    include: [
                        {
                            model: Department,
                            as: 'department'
                        }
                    ]
                }
            ]
        });

        res.status(201).json(created);
    } catch (error) {
        console.error('Error creating institution:', error);
        res.status(500).json({
            error: 'Failed to create institution',
            message: error.message
        });
    }
};

export default {
    getAllInstitutions,
    searchInstitutions,
    getInstitutionById,
    createInstitution
};
