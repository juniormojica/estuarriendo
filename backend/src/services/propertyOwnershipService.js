import { Property } from '../models/index.js';
import { badRequest, notFound } from '../errors/AppError.js';
import { ensureOwnUserOrAdmin } from '../utils/authorization.js';

export const assertContainerOwnership = async (req, containerId, { transaction, forbiddenMessage }) => {
    const container = await Property.findByPk(containerId, {
        attributes: ['id', 'ownerId', 'isContainer'],
        transaction
    });

    if (!container) {
        throw notFound('Pensión/apartamento no encontrado', { code: 'CONTAINER_NOT_FOUND' });
    }

    if (!container.isContainer) {
        throw badRequest('La propiedad no es una pensión/apartamento', { code: 'PROPERTY_NOT_CONTAINER' });
    }

    await ensureOwnUserOrAdmin(req, container.ownerId, {
        forbiddenCode: 'CONTAINER_ACCESS_FORBIDDEN',
        forbiddenMessage
    });

    return container;
};

export const assertUnitOwnership = async (req, unitId, { transaction, forbiddenMessage }) => {
    const unit = await Property.findByPk(unitId, {
        attributes: ['id', 'parentId'],
        transaction
    });

    if (!unit) {
        throw notFound('Habitación no encontrada', { code: 'UNIT_NOT_FOUND' });
    }

    if (!unit.parentId) {
        throw badRequest('La propiedad no es una habitación', { code: 'PROPERTY_NOT_UNIT' });
    }

    const container = await Property.findByPk(unit.parentId, {
        attributes: ['id', 'ownerId', 'isContainer'],
        transaction
    });

    if (!container) {
        throw notFound('Pensión/apartamento no encontrado', { code: 'CONTAINER_NOT_FOUND' });
    }

    if (!container.isContainer) {
        throw badRequest('La propiedad padre no es una pensión/apartamento', { code: 'INVALID_CONTAINER_PARENT' });
    }

    await ensureOwnUserOrAdmin(req, container.ownerId, {
        forbiddenCode: 'UNIT_ACCESS_FORBIDDEN',
        forbiddenMessage
    });

    return unit;
};

export default {
    assertContainerOwnership,
    assertUnitOwnership
};
