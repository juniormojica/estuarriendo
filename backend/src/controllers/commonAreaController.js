import { CommonArea } from '../models/index.js';
import { badRequest, conflict, notFound } from '../errors/AppError.js';

const slugify = (name) => {
    return name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        || 'unknown';
};

export const getAllCommonAreas = async (req, res, next) => {
    try {
        const commonAreas = await CommonArea.findAll({
            order: [['name', 'ASC']]
        });
        res.json(commonAreas);
    } catch (error) {
        next(error);
    }
};

export const getCommonAreaById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const commonArea = await CommonArea.findByPk(id);

        if (!commonArea) {
            throw notFound('Common area not found', { code: 'COMMON_AREA_NOT_FOUND' });
        }

        res.json(commonArea);
    } catch (error) {
        next(error);
    }
};

export const createCommonArea = async (req, res, next) => {
    try {
        const { name, icon, description } = req.body;

        if (!name) {
            throw badRequest('Common area name is required', { code: 'COMMON_AREA_NAME_REQUIRED' });
        }

        const existing = await CommonArea.findOne({ where: { name } });
        if (existing) {
            throw conflict('Common area already exists', { code: 'COMMON_AREA_ALREADY_EXISTS' });
        }

        const slug = slugify(name);

        const commonArea = await CommonArea.create({ name, icon, slug, description });
        res.status(201).json(commonArea);
    } catch (error) {
        next(error);
    }
};

export const updateCommonArea = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, icon, description } = req.body;

        const commonArea = await CommonArea.findByPk(id);
        if (!commonArea) {
            throw notFound('Common area not found', { code: 'COMMON_AREA_NOT_FOUND' });
        }

        const slug = name && name !== commonArea.name ? slugify(name) : commonArea.slug;

        await commonArea.update({ name, icon, slug, description });
        res.json(commonArea);
    } catch (error) {
        next(error);
    }
};

export const deleteCommonArea = async (req, res, next) => {
    try {
        const { id } = req.params;

        const commonArea = await CommonArea.findByPk(id);
        if (!commonArea) {
            throw notFound('Common area not found', { code: 'COMMON_AREA_NOT_FOUND' });
        }

        await commonArea.destroy();
        res.json({ message: 'Common area deleted successfully' });
    } catch (error) {
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return next(conflict('Cannot delete common area: it is referenced by one or more properties', { code: 'COMMON_AREA_IN_USE' }));
        }
        next(error);
    }
};

export default {
    getAllCommonAreas,
    getCommonAreaById,
    createCommonArea,
    updateCommonArea,
    deleteCommonArea
};
