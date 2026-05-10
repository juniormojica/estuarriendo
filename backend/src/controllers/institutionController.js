import { Institution, City, Department } from '../models/index.js';
import { Op } from 'sequelize';
import { badRequest, conflict, notFound } from '../errors/AppError.js';

/**
 * Institution Controller
 * Handles institution endpoints for autocomplete and filtering
 */

/**
 * Get all institutions
 * GET /api/institutions?cityId=1&type=universidad
 */
export const getAllInstitutions = async (req, res, next) => {
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
            attributes: ['id', 'name', 'cityId', 'type', 'acronym', 'latitude', 'longitude']
        });

        // Convert latitude and longitude from strings to numbers
        const institutionsWithCoords = institutions.map(inst => {
            const data = inst.toJSON();
            return {
                ...data,
                latitude: data.latitude ? parseFloat(data.latitude) : null,
                longitude: data.longitude ? parseFloat(data.longitude) : null
            };
        });

        res.json(institutionsWithCoords);
    } catch (error) {
        next(error);
    }
};

/**
 * Search institutions by name (autocomplete)
 * GET /api/institutions/search?q=nacional&cityId=1&type=universidad
 */
export const searchInstitutions = async (req, res, next) => {
    try {
        const { q, cityId, type, limit = 10 } = req.query;

        if (!q || q.length < 2) {
            return next(badRequest('Query parameter "q" must be at least 2 characters', {
                code: 'INSTITUTION_SEARCH_QUERY_TOO_SHORT'
            }));
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
        next(error);
    }
};

/**
 * Get institution by ID
 * GET /api/institutions/:id
 */
export const getInstitutionById = async (req, res, next) => {
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
            return next(notFound('Institution not found', { code: 'INSTITUTION_NOT_FOUND' }));
        }

        res.json(institution);
    } catch (error) {
        next(error);
    }
};

/**
 * Create new institution (admin only)
 * POST /api/institutions
 */
export const createInstitution = async (req, res, next) => {
    try {
        const { name, cityId, type, acronym, latitude, longitude } = req.body;

        // Validate required fields
        if (!name || !cityId || !type) {
            return next(badRequest('Missing required fields: name, cityId, type', {
                code: 'INSTITUTION_REQUIRED_FIELDS'
            }));
        }

        // Check if city exists
        const city = await City.findByPk(cityId);
        if (!city) {
            return next(notFound('City not found', { code: 'CITY_NOT_FOUND' }));
        }

        // Check if institution already exists
        const existing = await Institution.findOne({
            where: { name, cityId }
        });

        if (existing) {
            return next(conflict('Institution with this name already exists in this city', {
                code: 'INSTITUTION_NAME_EXISTS'
            }));
        }

        // Validate and convert coordinates if provided
        let validLatitude = null;
        let validLongitude = null;

        if (latitude !== undefined && latitude !== null && latitude !== '') {
            const lat = parseFloat(latitude);
            if (isNaN(lat) || lat < -90 || lat > 90) {
                return next(badRequest('Invalid latitude. Must be between -90 and 90', {
                    code: 'INSTITUTION_INVALID_LATITUDE'
                }));
            }
            validLatitude = lat;
        }

        if (longitude !== undefined && longitude !== null && longitude !== '') {
            const lng = parseFloat(longitude);
            if (isNaN(lng) || lng < -180 || lng > 180) {
                return next(badRequest('Invalid longitude. Must be between -180 and 180', {
                    code: 'INSTITUTION_INVALID_LONGITUDE'
                }));
            }
            validLongitude = lng;
        }

        const institution = await Institution.create({
            name,
            cityId,
            type,
            acronym,
            latitude: validLatitude,
            longitude: validLongitude
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
        next(error);
    }
};

/**
 * Update institution (admin only)
 * PUT /api/institutions/:id
 */
export const updateInstitution = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, cityId, type, acronym, latitude, longitude } = req.body;

        const institution = await Institution.findByPk(id);
        if (!institution) {
            return next(notFound('Institution not found', { code: 'INSTITUTION_NOT_FOUND' }));
        }

        // If city is being changed, verify it exists
        if (cityId && cityId !== institution.cityId) {
            const city = await City.findByPk(cityId);
            if (!city) {
                return next(notFound('City not found', { code: 'CITY_NOT_FOUND' }));
            }
        }

        // Check if name is being changed and if new name already exists in the city
        const targetCityId = cityId || institution.cityId;
        if (name && (name !== institution.name || cityId !== institution.cityId)) {
            const existing = await Institution.findOne({
                where: { name, cityId: targetCityId }
            });
            if (existing && existing.id !== parseInt(id)) {
                return next(conflict('Institution with this name already exists in this city', {
                    code: 'INSTITUTION_NAME_EXISTS'
                }));
            }
        }

        await institution.update({
            name: name || institution.name,
            cityId: cityId || institution.cityId,
            type: type || institution.type,
            acronym: acronym !== undefined ? acronym : institution.acronym,
            latitude: latitude !== undefined ? latitude : institution.latitude,
            longitude: longitude !== undefined ? longitude : institution.longitude,
            updatedAt: new Date()
        });

        // Fetch with associations
        const updated = await Institution.findByPk(id, {
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

        res.json(updated);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete institution (admin only)
 * DELETE /api/institutions/:id
 */
export const deleteInstitution = async (req, res, next) => {
    try {
        const { id } = req.params;

        const institution = await Institution.findByPk(id);
        if (!institution) {
            return next(notFound('Institution not found', { code: 'INSTITUTION_NOT_FOUND' }));
        }

        await institution.destroy();
        res.json({ message: 'Institution deleted successfully' });
    } catch (error) {
        // Handle foreign key constraint errors
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return next(conflict('This institution is referenced by properties or student requests', {
                code: 'INSTITUTION_IN_USE'
            }));
        }

        next(error);
    }
};

export default {
    getAllInstitutions,
    searchInstitutions,
    getInstitutionById,
    createInstitution,
    updateInstitution,
    deleteInstitution
};
