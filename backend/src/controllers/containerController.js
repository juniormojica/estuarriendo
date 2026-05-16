import containerService from '../services/containerService.js';
import * as propertyService from '../services/propertyService.js';
import { sequelize } from '../models/index.js';
import { AppError, badRequest, forbidden, notFound } from '../errors/AppError.js';
import { UserType } from '../utils/enums.js';
import { ensureOwnUserOrAdmin } from '../utils/authorization.js';
import { assertContainerOwnership, assertUnitOwnership } from '../services/propertyOwnershipService.js';
import { sanitizePublicProperty, sanitizePublicPropertyList } from '../services/publicPropertySanitizer.js';

/**
 * Container Controller
 * Handles HTTP requests for container and unit management
 */

/**
 * Create a new container (pension, apartment, aparta-estudio)
 * POST /api/containers
 */
/**
 * Get containers that are pending or have pending units
 * GET /api/containers/pending
 */
export const getPendingContainers = async (req, res, next) => {
    try {
        const { Property } = await import('../models/index.js');

        // 1. Find containers with pending units
        const containersWithPendingUnits = await Property.findAll({
            where: { isContainer: true },
            include: [{
                model: Property,
                as: 'units',
                where: { status: 'pending' },
                attributes: ['id'],
                required: true
            }]
        });

        // 2. Find containers that are pending themselves
        const pendingContainers = await Property.findAll({
            where: {
                isContainer: true,
                status: 'pending'
            },
            attributes: ['id']
        });

        // 3. Combine unique IDs
        const containerIds = [...new Set([
            ...containersWithPendingUnits.map(c => c.id),
            ...pendingContainers.map(c => c.id)
        ])];

        if (containerIds.length === 0) {
            return res.json({ success: true, data: [] });
        }

        // 4. Fetch full details using service (which includes our new stats)
        const result = await Promise.all(
            containerIds.map(id => containerService.findContainerWithUnits(id))
        );

        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const createContainer = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            services = [],
            rules = [],
            commonAreaIds = [],
            units = [],
            location,
            images,
            nearbyInstitutions = [],
            ...propertyData
        } = req.body;

        const ownerId = req.userId; // From auth middleware

        // Import all required models once
        const { Property, PropertyService, PropertyRule, PropertyImage, Amenity, ActivityLog } = await import('../models/index.js');

        // For containers rented by_unit, monthlyRent should be 0 (price is per unit)
        // For containers rented complete, use provided monthlyRent or default to 0
        const monthlyRent = propertyData.rentalMode === 'by_unit'
            ? 0
            : (propertyData.monthlyRent || 0);

        // 1. Create container using propertyService (handles location and images)
        const container = await propertyService.createPropertyWithAssociations({
            ...propertyData,
            monthlyRent,
            location,
            images,
            institutions: nearbyInstitutions,
            ownerId,
            isContainer: true,
            totalUnits: 0,
            availableUnits: 0
        });

        // 2. Add services if provided
        if (services.length > 0) {
            const servicePromises = services.map(service =>
                PropertyService.create({
                    propertyId: container.id,
                    ...service
                }, { transaction })
            );
            await Promise.all(servicePromises);
        }

        // 3. Add rules if provided
        if (rules.length > 0) {
            const rulePromises = rules.map(rule =>
                PropertyRule.create({
                    propertyId: container.id,
                    ...rule
                }, { transaction })
            );
            await Promise.all(rulePromises);
        }

        // 4. Add common areas if provided
        if (commonAreaIds.length > 0) {
            const containerRecord = await Property.findByPk(container.id, { transaction });
            await containerRecord.setCommonAreas(commonAreaIds, { transaction });
        }

        // 5. Create units if provided
        if (units.length > 0) {
            for (const unitData of units) {
                const { images: unitImages, amenityIds, ...coreUnitData } = unitData;

                // Create unit
                const unit = await Property.create({
                    ...coreUnitData,
                    parentId: container.id,
                    isContainer: false,
                    locationId: container.locationId,
                    typeId: 1, // Units within a container are always 'habitacion' (ID 1)
                    ownerId: container.ownerId
                }, { transaction });

                // Add unit images - Expecting URLs from frontend
                if (unitImages && unitImages.length > 0) {
                    // Normalize images to plain URLs strings
                    const imageUrls = unitImages.map(img =>
                        typeof img === 'string' ? img : img.url
                    ).filter(url => url && !url.startsWith('data:image')); // Filter out any accidental base64

                    if (imageUrls.length > 0) {
                        const imageRecords = imageUrls.map((url, index) => ({
                            propertyId: unit.id,
                            url: url,
                            isFeatured: index === 0,
                            displayOrder: index // Normalized field name (check model if it uses orderPosition or displayOrder)
                        }));

                        // Using 'displayOrder' as per PropertyImage interface in types, but propertyService uses 'displayOrder' too?
                        // Let's check typical usage. propertyService.js creates images? 
                        // Actually propertyService.createPropertyWithAssociations handles 'images' which are URLs.
                        // I will stick to what the code was using: 'orderPosition'. 
                        // Wait, previous code used 'orderPosition': index.
                        // I will use 'orderPosition' to be safe match.

                        const imageRecordsSafe = imageUrls.map((url, index) => ({
                            propertyId: unit.id,
                            url: url,
                            isFeatured: index === 0,
                            orderPosition: index
                        }));

                        await PropertyImage.bulkCreate(imageRecordsSafe, { transaction });
                    }
                }

                // Add amenities to unit
                if (amenityIds && amenityIds.length > 0) {
                    const amenities = await Amenity.findAll({
                        where: { id: amenityIds },
                        transaction
                    });
                    await unit.setAmenities(amenities, { transaction });
                }
            }

            // Update container unit counts
            await Property.update({
                totalUnits: units.length,
                availableUnits: units.length
            }, {
                where: { id: container.id },
                transaction
            });
        }

        await transaction.commit();

        // Fetch complete container with all associations
        const completeContainer = await containerService.findContainerWithUnits(container.id);

        // Log activity
        await ActivityLog.create({
            type: 'container_submitted',
            message: `Nueva propiedad (Container) enviada por ${req.user ? req.user.name : 'Propietario'}: ${completeContainer.title}`,
            userId: ownerId,
            propertyId: container.id,
            timestamp: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Pensión/apartamento creado exitosamente',
            data: completeContainer
        });
    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        next(error);
    }
};

/**
 * Get container with all units and associations
 * GET /api/containers/:id
 */
export const getContainer = async (req, res, next) => {
    try {
        const { id } = req.params;

        const container = await containerService.findContainerWithUnits(id);

        if (!container) {
            return next(notFound('Pensión/apartamento no encontrado', { code: 'CONTAINER_NOT_FOUND' }));
        }

        if (container.status !== 'approved') {
            return next(notFound('Pensión/apartamento no encontrado', { code: 'CONTAINER_NOT_FOUND' }));
        }

        const approvedUnits = Array.isArray(container.units)
            ? container.units.filter((unit) => unit.status === 'approved')
            : [];

        if (container.dataValues) {
            container.dataValues.units = approvedUnits;
            container.dataValues.unitStats = {
                approved: approvedUnits.length,
                total: approvedUnits.length
            };
        }

        const sanitizedContainer = sanitizePublicProperty(container);

        res.status(200).json({
            success: true,
            data: sanitizedContainer
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update container
 * PUT /api/containers/:id
 */
export const updateContainer = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const {
            services,
            rules,
            commonAreaIds,
            skipStatusReset,
            ...propertyFields
        } = req.body;

        const { Property, PropertyService, PropertyRule } = await import('../models/index.js');

        const container = await Property.findByPk(id, { transaction });

        if (!container) {
            await transaction.rollback();
            return next(notFound('Pensión/apartamento no encontrado', { code: 'CONTAINER_NOT_FOUND' }));
        }

        await ensureOwnUserOrAdmin(req, container.ownerId, {
            forbiddenCode: 'CONTAINER_ACCESS_FORBIDDEN',
            forbiddenMessage: 'No autorizado para actualizar esta pensión/apartamento'
        });

        // Ensure only valid property fields are updated 
        if (Object.keys(propertyFields).length > 0) {
            await container.update(propertyFields, { transaction });
        }

        // Important: Update status to 'pending' after an owner edit
        // Only skip if explicitly asked (e.g., admin action) or if already pending 
        if (!skipStatusReset && container.status === 'approved') {
            await container.update({
                status: 'pending',
                reviewedAt: null,
                submittedAt: new Date()
            }, { transaction });
        }

        // Update services if provided
        if (services) {
            await PropertyService.destroy({ where: { propertyId: id }, transaction });

            const servicePromises = services.map(service =>
                PropertyService.create({
                    propertyId: id,
                    ...service
                }, { transaction })
            );
            await Promise.all(servicePromises);
        }

        // Update rules if provided
        if (rules) {
            await PropertyRule.destroy({ where: { propertyId: id }, transaction });

            const rulePromises = rules.map(rule =>
                PropertyRule.create({
                    propertyId: id,
                    ...rule
                }, { transaction })
            );
            await Promise.all(rulePromises);
        }

        // Update common areas if provided
        if (commonAreaIds) {
            await container.setCommonAreas(commonAreaIds, { transaction });
        }

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Pensión/apartamento actualizado exitosamente',
            data: {
                id: container.id,
                status: container.status
            }
        });
    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        next(error);
    }
};

/**
 * Delete container
 * DELETE /api/containers/:id
 */
export const deleteContainer = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;

        const { Property } = await import('../models/index.js');

        const container = await Property.findByPk(id, { transaction });

        if (!container) {
            await transaction.rollback();
            return next(notFound('Pensión/apartamento no encontrado', { code: 'CONTAINER_NOT_FOUND' }));
        }

        await ensureOwnUserOrAdmin(req, container.ownerId, {
            forbiddenCode: 'CONTAINER_ACCESS_FORBIDDEN',
            forbiddenMessage: 'No autorizado para eliminar esta pensión/apartamento'
        });

        await container.destroy({ transaction });

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Pensión/apartamento eliminado exitosamente'
        });
    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        next(error);
    }
};

/**
 * Rent complete container
 * POST /api/containers/:id/rent-complete
 */
export const rentCompleteContainer = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;

        await assertContainerOwnership(req, id, {
            transaction,
            forbiddenMessage: 'No autorizado para alquilar esta pensión/apartamento por completo'
        });

        const container = await containerService.rentCompleteContainer(id, transaction);

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Pensión/apartamento alquilado por completo',
            data: container
        });
    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        if (error instanceof AppError) {
            return next(error);
        }
        next(badRequest(error.message, { code: 'RENT_COMPLETE_FAILED' }));
    }
};

/**
 * Change rental mode
 * POST /api/containers/:id/change-mode
 */
export const changeRentalMode = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const { mode } = req.body;

        await assertContainerOwnership(req, id, {
            transaction,
            forbiddenMessage: 'No autorizado para cambiar el modo de alquiler de esta pensión/apartamento'
        });

        let container;

        if (mode === 'by_unit') {
            container = await containerService.changeToByUnitMode(id, transaction);
        } else {
            throw new Error('Modo de alquiler inválido');
        }

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: `Modo de alquiler cambiado a ${mode}`,
            data: container
        });
    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        if (error instanceof AppError) {
            return next(error);
        }
        next(badRequest(error.message, { code: 'RENTAL_MODE_CHANGE_FAILED' }));
    }
};

/**
 * Create unit in container
 * POST /api/containers/:containerId/units
 */
export const createUnit = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const { containerId } = req.params;
        const { images, ...unitData } = req.body;

        await assertContainerOwnership(req, containerId, {
            transaction,
            forbiddenMessage: 'No autorizado para crear habitaciones en esta pensión/apartamento'
        });

        const unit = await containerService.createUnit(containerId, unitData, transaction);

        const { PropertyImage } = await import('../models/index.js');

        if (images && images.length > 0) {
            const imageRecords = images.map((img, index) => ({
                propertyId: unit.id,
                url: typeof img === 'string' ? img : img.url,
                isFeatured: typeof img === 'string' ? index === 0 : (img.isFeatured || index === 0),
                orderPosition: typeof img === 'string' ? index : (img.orderPosition || index)
            }));
            await PropertyImage.bulkCreate(imageRecords, { transaction });
        }

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: 'Habitación creada exitosamente',
            data: unit
        });
    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        next(error);
    }
};

/**
 * Get all units of a container
 * GET /api/containers/:containerId/units
 */
export const getContainerUnits = async (req, res, next) => {
    try {
        const { containerId } = req.params;

        const { Property, PropertyImage, Amenity } = await import('../models/index.js');

        const container = await Property.findByPk(containerId, {
            attributes: ['id', 'status', 'isContainer']
        });

        if (!container || !container.isContainer || container.status !== 'approved') {
            return next(notFound('Pensión/apartamento no encontrado', { code: 'CONTAINER_NOT_FOUND' }));
        }

        const units = await Property.findAll({
            where: {
                parentId: containerId,
                status: 'approved'
            },
            include: [
                { model: PropertyImage, as: 'images' },
                { model: Amenity, as: 'amenities', through: { attributes: [] } }
            ]
        });

        const sanitizedUnits = sanitizePublicPropertyList(units);

        res.status(200).json({
            success: true,
            data: sanitizedUnits
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update unit
 * PUT /api/units/:id
 */
export const updateUnit = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const { images, ...updateData } = req.body;

        const { Property, PropertyImage } = await import('../models/index.js');

        const unit = await assertUnitOwnership(req, id, {
            transaction,
            forbiddenMessage: 'No autorizado para actualizar esta habitación'
        });

        await unit.update(updateData, { transaction });

        if (images !== undefined) {
            await PropertyImage.destroy({ where: { propertyId: id }, transaction });
            
            if (images && images.length > 0) {
                const imageRecords = images.map((img, index) => ({
                    propertyId: id,
                    url: typeof img === 'string' ? img : img.url,
                    isFeatured: typeof img === 'string' ? index === 0 : (img.isFeatured || index === 0),
                    orderPosition: typeof img === 'string' ? index : (img.orderPosition || index)
                }));
                await PropertyImage.bulkCreate(imageRecords, { transaction });
            }
        }

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Habitación actualizada exitosamente',
            data: unit
        });
    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        next(error);
    }
};

/**
 * Delete unit
 * DELETE /api/units/:id
 */
export const deleteUnit = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;

        await assertUnitOwnership(req, id, {
            transaction,
            forbiddenMessage: 'No autorizado para eliminar esta habitación'
        });

        await containerService.deleteUnit(id, transaction);

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Habitación eliminada exitosamente'
        });
    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        next(error);
    }
};

/**
 * Update unit rental status
 * PATCH /api/units/:id/rental-status
 */
export const updateUnitRentalStatus = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const { isRented } = req.body;

        await assertUnitOwnership(req, id, {
            transaction,
            forbiddenMessage: 'No autorizado para modificar el estado de alquiler de esta habitación'
        });

        const unit = await containerService.updateUnitRentalStatus(id, isRented, transaction);

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Estado de alquiler de habitación actualizado',
            data: unit
        });
    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        next(error);
    }
};

/**
 * Approve unit and check if container should be auto-approved
 * PUT /api/units/:id/approve
 */
export const approveUnit = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { Property, Notification } = await import('../models/index.js');

        const unit = await Property.findByPk(id, { transaction });
        if (!unit) {
            await transaction.rollback();
            return next(notFound('Habitación no encontrada', { code: 'UNIT_NOT_FOUND' }));
        }

        if (!unit.parentId) {
            await transaction.rollback();
            return next(badRequest('La propiedad no es una habitación', { code: 'PROPERTY_NOT_UNIT' }));
        }

        const oldStatus = unit.status;

        // Update unit status
        await unit.update({
            status: 'approved',
            isVerified: true,
            reviewedAt: new Date(),
            rejectionReason: null
        }, { transaction });

        // Check if all units of container are now approved
        const container = await Property.findByPk(unit.parentId, {
            include: [{ model: Property, as: 'units' }],
            transaction
        });

        const allUnitsApproved = container.units.every(u =>
            u.id === unit.id ? true : u.status === 'approved'
        );

        let containerApproved = false;
        if (allUnitsApproved && container.status !== 'approved') {
            await container.update({
                status: 'approved',
                isVerified: true,
                reviewedAt: new Date()
            }, { transaction });
            containerApproved = true;

            // Notify owner about container approval
            await Notification.create({
                userId: container.ownerId,
                type: 'property_approved',
                title: '¡Pensión aprobada!',
                message: `Tu pensión "${container.title}" ha sido aprobada completamente.`,
                propertyId: container.id,
                isRead: false
            }, { transaction });
        } else if (oldStatus !== 'approved') {
            // Notify about individual unit approval
            await Notification.create({
                userId: container.ownerId,
                type: 'property_approved',
                title: 'Habitación aprobada',
                message: `La habitación "${unit.title}" de tu pensión "${container.title}" ha sido aprobada.`,
                propertyId: unit.id,
                isRead: false
            }, { transaction });
        }

        await transaction.commit();

        res.json({
            success: true,
            message: 'Habitación aprobada exitosamente',
            data: { unit, containerApproved }
        });
    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        next(error);
    }
};

/**
 * Reject unit
 * PUT /api/units/:id/reject
 */
export const rejectUnit = async (req, res, next) => {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
        return next(badRequest('El motivo de rechazo es requerido'));
    }

    const transaction = await sequelize.transaction();

    try {
        const { Property, Notification } = await import('../models/index.js');

        const unit = await Property.findByPk(id, { transaction });
        if (!unit) {
            await transaction.rollback();
            return next(notFound('Habitación no encontrada', { code: 'UNIT_NOT_FOUND' }));
        }

        if (!unit.parentId) {
            await transaction.rollback();
            return next(badRequest('La propiedad no es una habitación', { code: 'PROPERTY_NOT_UNIT' }));
        }

        await unit.update({
            status: 'rejected',
            isVerified: false,
            reviewedAt: new Date(),
            rejectionReason: reason
        }, { transaction });

        // Get container for notification
        const container = await Property.findByPk(unit.parentId, { transaction });

        // Notify owner about unit rejection
        await Notification.create({
            userId: container.ownerId,
            type: 'property_rejected',
            title: 'Habitación rechazada',
            message: `La habitación "${unit.title}" de tu pensión "${container.title}" ha sido rechazada. Motivo: ${reason}`,
            propertyId: unit.id,
            isRead: false
        }, { transaction });

        await transaction.commit();

        res.json({
            success: true,
            message: 'Habitación rechazada',
            data: unit
        });
    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        next(error);
    }
};

/**
 * Approve container and all its pending units
 * PUT /api/containers/:id/approve
 */
export const approveContainer = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { Property, Notification, ActivityLog } = await import('../models/index.js');

        // Get container with all units
        const container = await Property.findByPk(id, {
            include: [{ model: Property, as: 'units' }],
            transaction
        });

        if (!container) {
            await transaction.rollback();
            return next(notFound('Pensión/apartamento no encontrado', { code: 'CONTAINER_NOT_FOUND' }));
        }

        if (!container.isContainer) {
            await transaction.rollback();
            return next(badRequest('La propiedad no es una pensión/apartamento', { code: 'PROPERTY_NOT_CONTAINER' }));
        }

        // Approve all pending units
        const pendingUnits = container.units.filter(u => u.status === 'pending');
        for (const unit of pendingUnits) {
            await unit.update({
                status: 'approved',
                isVerified: true,
                reviewedAt: new Date(),
                rejectionReason: null
            }, { transaction });
        }

        // Approve container itself
        await container.update({
            status: 'approved',
            isVerified: true,
            reviewedAt: new Date(),
            rejectionReason: null
        }, { transaction });

        // Log activity
        await ActivityLog.create({
            type: 'property_approved',
            message: `Container aprobado: ${container.title}`,
            userId: req.userId,
            propertyId: container.id,
            timestamp: new Date()
        }, { transaction });

        // Send notification to owner
        await Notification.create({
            userId: container.ownerId,
            type: 'property_approved',
            title: '¡Pensión aprobada!',
            message: `Tu pensión "${container.title}" y todas sus habitaciones han sido aprobadas.`,
            propertyId: container.id,
            isRead: false
        }, { transaction });

        await transaction.commit();

        res.json({
            success: true,
            message: 'Pensión/apartamento y todas sus habitaciones aprobadas exitosamente',
            data: {
                container,
                approvedUnitsCount: pendingUnits.length
            }
        });
    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        next(error);
    }
};

/**
 * Admin: Create a container on behalf of an owner
 * POST /api/containers/admin-create
 */
export const adminCreateContainer = async (req, res, next) => {
    try {
        const { User } = await import('../models/index.js');

        const adminUser = await User.findByPk(req.userId);
        if (!adminUser || ![UserType.ADMIN, UserType.SUPER_ADMIN].includes(adminUser.userType)) {
            return next(forbidden('No tienes permisos para realizar esta acción'));
        }

        const { targetOwnerId, ...containerData } = req.body;

        if (!targetOwnerId) {
            return next(badRequest('Se requiere el ID del propietario (targetOwnerId)'));
        }

        const owner = await User.findByPk(targetOwnerId);
        if (!owner) {
            return next(notFound('Propietario no encontrado'));
        }

        if (owner.userType !== UserType.OWNER && owner.userType !== UserType.ADMIN && owner.userType !== UserType.SUPER_ADMIN) {
            return next(badRequest('El usuario seleccionado no tiene rol de propietario'));
        }

        req.userId = targetOwnerId;
        req.body = containerData;

        return createContainer(req, res, next);

    } catch (error) {
        next(error);
    }
};

export default {
    createContainer,
    getPendingContainers,
    getContainer,
    updateContainer,
    deleteContainer,
    rentCompleteContainer,
    changeRentalMode,
    createUnit,
    getContainerUnits,
    updateUnit,
    deleteUnit,
    updateUnitRentalStatus,
    approveUnit,
    rejectUnit,
    approveContainer,
    adminCreateContainer
};
