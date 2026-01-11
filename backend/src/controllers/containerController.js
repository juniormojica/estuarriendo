import containerService from '../services/containerService.js';
import { sequelize } from '../models/index.js';

/**
 * Container Controller
 * Handles HTTP requests for container and unit management
 */

/**
 * Create a new container (pension, apartment, aparta-estudio)
 * POST /api/containers
 */
export const createContainer = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const containerData = {
            ...req.body,
            ownerId: req.userId // From auth middleware
        };

        const container = await containerService.createContainer(containerData, transaction);

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: 'Container created successfully',
            data: container
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

export default {
    createContainer,
    getContainer,
    updateContainer,
    deleteContainer,
    rentCompleteContainer,
    changeRentalMode,
    createUnit,
    getContainerUnits,
    updateUnit,
    deleteUnit,
    updateUnitRentalStatus
};
