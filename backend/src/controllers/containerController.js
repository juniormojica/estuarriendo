import containerService from '../services/containerService.js';
import * as propertyService from '../services/propertyService.js';
import { sequelize } from '../models/index.js';

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
export const getPendingContainers = async (req, res) => {
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
        console.error('Error getting pending containers:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting pending containers',
            error: error.message
        });
    }
};

export const createContainer = async (req, res) => {
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
            type: 'property_submitted',
            message: `Nueva propiedad (Container) enviada por ${req.user ? req.user.name : 'Propietario'}: ${completeContainer.title}`,
            userId: ownerId,
            propertyId: container.id,
            timestamp: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Container created successfully',
            data: completeContainer
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating container:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating container',
            error: error.message
        });
    }
};

/**
 * Get container with all units and associations
 * GET /api/containers/:id
 */
export const getContainer = async (req, res) => {
    try {
        const { id } = req.params;

        const container = await containerService.findContainerWithUnits(id);

        if (!container) {
            return res.status(404).json({
                success: false,
                message: 'Container not found'
            });
        }

        res.status(200).json({
            success: true,
            data: container
        });
    } catch (error) {
        console.error('Error getting container:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting container',
            error: error.message
        });
    }
};

/**
 * Update container
 * PUT /api/containers/:id
 */
export const updateContainer = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const updateData = req.body;

        const { Property } = await import('../models/index.js');

        const container = await Property.findByPk(id, { transaction });

        if (!container) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Container not found'
            });
        }

        // Verify ownership (simplified - only owner can update)
        if (container.ownerId !== req.userId) {
            await transaction.rollback();
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this container'
            });
        }

        await container.update(updateData, { transaction });

        // Update services if provided
        if (updateData.services) {
            const { PropertyService } = await import('../models/index.js');
            await PropertyService.destroy({ where: { propertyId: id }, transaction });

            const servicePromises = updateData.services.map(service =>
                PropertyService.create({
                    propertyId: id,
                    ...service
                }, { transaction })
            );
            await Promise.all(servicePromises);
        }

        // Update rules if provided
        if (updateData.rules) {
            const { PropertyRule } = await import('../models/index.js');
            await PropertyRule.destroy({ where: { propertyId: id }, transaction });

            const rulePromises = updateData.rules.map(rule =>
                PropertyRule.create({
                    propertyId: id,
                    ...rule
                }, { transaction })
            );
            await Promise.all(rulePromises);
        }

        // Update common areas if provided
        if (updateData.commonAreaIds) {
            await container.setCommonAreas(updateData.commonAreaIds, { transaction });
        }

        await transaction.commit();

        const updatedContainer = await containerService.findContainerWithUnits(id);

        res.status(200).json({
            success: true,
            message: 'Container updated successfully',
            data: updatedContainer
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating container:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating container',
            error: error.message
        });
    }
};

/**
 * Delete container
 * DELETE /api/containers/:id
 */
export const deleteContainer = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;

        const { Property } = await import('../models/index.js');

        const container = await Property.findByPk(id, { transaction });

        if (!container) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Container not found'
            });
        }

        // Verify ownership (simplified - only owner can delete)
        if (container.ownerId !== req.userId) {
            await transaction.rollback();
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this container'
            });
        }

        await container.destroy({ transaction });

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Container deleted successfully'
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error deleting container:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting container',
            error: error.message
        });
    }
};

/**
 * Rent complete container
 * POST /api/containers/:id/rent-complete
 */
export const rentCompleteContainer = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;

        const container = await containerService.rentCompleteContainer(id, transaction);

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Container rented completely',
            data: container
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error renting complete container:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Change rental mode
 * POST /api/containers/:id/change-mode
 */
export const changeRentalMode = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const { mode } = req.body;

        let container;

        if (mode === 'by_unit') {
            container = await containerService.changeToByUnitMode(id, transaction);
        } else {
            throw new Error('Invalid rental mode');
        }

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: `Rental mode changed to ${mode}`,
            data: container
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error changing rental mode:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Create unit in container
 * POST /api/containers/:containerId/units
 */
export const createUnit = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { containerId } = req.params;
        const unitData = req.body;

        const unit = await containerService.createUnit(containerId, unitData, transaction);

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: 'Unit created successfully',
            data: unit
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating unit:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating unit',
            error: error.message
        });
    }
};

/**
 * Get all units of a container
 * GET /api/containers/:containerId/units
 */
export const getContainerUnits = async (req, res) => {
    try {
        const { containerId } = req.params;

        const { Property, PropertyImage, Amenity } = await import('../models/index.js');

        const units = await Property.findAll({
            where: { parentId: containerId },
            include: [
                { model: PropertyImage, as: 'images' },
                { model: Amenity, as: 'amenities', through: { attributes: [] } }
            ]
        });

        res.status(200).json({
            success: true,
            data: units
        });
    } catch (error) {
        console.error('Error getting container units:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting container units',
            error: error.message
        });
    }
};

/**
 * Update unit
 * PUT /api/units/:id
 */
export const updateUnit = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const updateData = req.body;

        const { Property } = await import('../models/index.js');

        const unit = await Property.findByPk(id, { transaction });

        if (!unit) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Unit not found'
            });
        }

        if (!unit.parentId) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Property is not a unit'
            });
        }

        await unit.update(updateData, { transaction });

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Unit updated successfully',
            data: unit
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating unit:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating unit',
            error: error.message
        });
    }
};

/**
 * Delete unit
 * DELETE /api/units/:id
 */
export const deleteUnit = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;

        await containerService.deleteUnit(id, transaction);

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Unit deleted successfully'
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error deleting unit:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting unit',
            error: error.message
        });
    }
};

/**
 * Update unit rental status
 * PATCH /api/units/:id/rental-status
 */
export const updateUnitRentalStatus = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const { isRented } = req.body;

        const unit = await containerService.updateUnitRentalStatus(id, isRented, transaction);

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Unit rental status updated',
            data: unit
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating unit rental status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating unit rental status',
            error: error.message
        });
    }
};

/**
 * Approve unit and check if container should be auto-approved
 * PUT /api/units/:id/approve
 */
export const approveUnit = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { Property, Notification } = await import('../models/index.js');

        const unit = await Property.findByPk(id, { transaction });
        if (!unit) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'Unit not found' });
        }

        if (!unit.parentId) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Property is not a unit' });
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
            message: 'Unit approved successfully',
            data: { unit, containerApproved }
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error approving unit:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Reject unit
 * PUT /api/units/:id/reject
 */
export const rejectUnit = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({ success: false, message: 'Rejection reason is required' });
        }

        const { Property, Notification } = await import('../models/index.js');

        const unit = await Property.findByPk(id, { transaction });
        if (!unit) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'Unit not found' });
        }

        if (!unit.parentId) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Property is not a unit' });
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
            message: 'Unit rejected',
            data: unit
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error rejecting unit:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Approve container and all its pending units
 * PUT /api/containers/:id/approve
 */
export const approveContainer = async (req, res) => {
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
            return res.status(404).json({ success: false, message: 'Container not found' });
        }

        if (!container.isContainer) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Property is not a container' });
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
            userId: req.user.id,
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
            message: 'Container and all units approved successfully',
            data: {
                container,
                approvedUnitsCount: pendingUnits.length
            }
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error approving container:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Admin: Create a container on behalf of an owner
 * POST /api/containers/admin-create
 */
const adminCreateContainer = async (req, res) => {
    try {
        // 1. Check admin role
        // We need to import User model dynamically or use the one from models/index.js if available in scope
        // The controller imports { sequelize } from '../models/index.js' at top, but not User directly in top scope usually. 
        // Let's check imports. original file imported containerService, propertyService, sequelize.
        // I will import User locally to be safe.
        const { User } = await import('../models/index.js');

        const adminUser = await User.findByPk(req.userId);
        if (!adminUser || !['admin', 'superAdmin'].includes(adminUser.userType)) {
            return res.status(403).json({
                success: false,
                error: 'No tienes permisos para realizar esta acción'
            });
        }

        // 2. Validate target owner
        const { targetOwnerId, ...containerData } = req.body;

        if (!targetOwnerId) {
            return res.status(400).json({
                success: false,
                error: 'Se requiere el ID del propietario (targetOwnerId)'
            });
        }

        const owner = await User.findByPk(targetOwnerId);
        if (!owner) {
            return res.status(404).json({
                success: false,
                error: 'Propietario no encontrado'
            });
        }

        // Check if user is actually a user who can own properties (owner, admin, etc)
        // Ideally 'owner' userType.
        if (owner.userType !== 'owner' && owner.userType !== 'admin' && owner.userType !== 'superAdmin') {
            return res.status(400).json({
                success: false,
                error: 'El usuario seleccionado no tiene rol de propietario'
            });
        }

        // 3. Override userId in request to impersonate the owner for the creation logic
        // We utilize the existing createContainer logic but we need to trick it or reuse the service directly.
        // The existing createContainer extracts ownerId = req.userId.
        // So modifying req.userId is the cleanest way to reuse that controller logic 
        // WITHOUT duplicating the extensive validation and service calls in createContainer.

        req.userId = targetOwnerId;

        // Also ensure the body doesn't contain targetOwnerId anymore if createContainer works strictly with body
        req.body = containerData;

        // 4. Call createContainer
        return createContainer(req, res);

    } catch (error) {
        console.error('Error in adminCreateContainer:', error);
        return res.status(500).json({
            success: false,
            error: 'Error interno al crear propiedad por administrador',
            details: error.message
        });
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
