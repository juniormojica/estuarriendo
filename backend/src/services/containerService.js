import {
    Property,
    PropertyService,
    PropertyRule,
    CommonArea,
    PropertyCommonArea,
    PropertyImage,
    Amenity,
    Location,
    Contact,
    PropertyType,
    User,
    City,
    Department,
    sequelize
} from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Container Service
 * Handles business logic for property containers (pension, apartment, aparta-estudio)
 * and their units (rooms)
 */

/**
 * Create a container (pension, apartment, aparta-estudio)
 * @param {Object} containerData - Container data including services, rules, and common areas
 * @param {Object} transaction - Sequelize transaction
 * @returns {Promise<Object>} Created container
 */
export const createContainer = async (containerData, transaction = null) => {
    const {
        services = [],
        rules = [],
        commonAreaIds = [],
        ...propertyData
    } = containerData;

    try {
        // Ensure isContainer is true
        const container = await Property.create({
            ...propertyData,
            isContainer: true,
            totalUnits: 0,
            availableUnits: 0
        }, { transaction });

        // Add services if provided
        if (services.length > 0) {
            const servicePromises = services.map(service =>
                PropertyService.create({
                    propertyId: container.id,
                    ...service
                }, { transaction })
            );
            await Promise.all(servicePromises);
        }

        // Add rules if provided
        if (rules.length > 0) {
            const rulePromises = rules.map(rule =>
                PropertyRule.create({
                    propertyId: container.id,
                    ...rule
                }, { transaction })
            );
            await Promise.all(rulePromises);
        }

        // Add common areas if provided
        if (commonAreaIds.length > 0) {
            await container.setCommonAreas(commonAreaIds, { transaction });
        }

        return container;
    } catch (error) {
        throw new Error(`Error creating container: ${error.message}`);
    }
};

/**
 * Create a unit (room) within a container
 * @param {number} containerId - ID of the parent container
 * @param {Object} unitData - Unit data
 * @param {Object} transaction - Sequelize transaction
 * @returns {Promise<Object>} Created unit
 */
export const createUnit = async (containerId, unitData, transaction = null) => {
    try {
        // Verify container exists and is actually a container
        const container = await Property.findByPk(containerId, { transaction });

        if (!container) {
            throw new Error('Container not found');
        }

        if (!container.isContainer) {
            throw new Error('Parent property is not a container');
        }

        // Create unit
        const unit = await Property.create({
            ...unitData,
            parentId: containerId,
            isContainer: false,
            // Inherit location from container
            locationId: container.locationId,
            typeId: container.typeId,
            ownerId: container.ownerId
        }, { transaction });

        // Update container's unit counts
        await container.update({
            totalUnits: container.totalUnits + 1,
            availableUnits: container.availableUnits + 1
        }, { transaction });

        return unit;
    } catch (error) {
        throw new Error(`Error creating unit: ${error.message}`);
    }
};

/**
 * Update container availability based on unit rental status
 * @param {number} containerId - ID of the container
 * @param {Object} transaction - Sequelize transaction
 * @returns {Promise<Object>} Updated container
 */
export const updateContainerAvailability = async (containerId, transaction = null) => {
    try {
        const container = await Property.findByPk(containerId, {
            include: [{ model: Property, as: 'units' }],
            transaction
        });

        if (!container) {
            throw new Error('Container not found');
        }

        if (!container.isContainer) {
            throw new Error('Property is not a container');
        }

        // Count available units (not rented)
        const availableCount = container.units.filter(unit => !unit.isRented).length;

        await container.update({
            availableUnits: availableCount
        }, { transaction });

        return container;
    } catch (error) {
        throw new Error(`Error updating container availability: ${error.message}`);
    }
};

/**
 * Rent complete container (mark all units as rented)
 * @param {number} containerId - ID of the container
 * @param {Object} transaction - Sequelize transaction
 * @returns {Promise<Object>} Updated container
 */
export const rentCompleteContainer = async (containerId, transaction = null) => {
    try {
        const container = await Property.findByPk(containerId, {
            include: [{ model: Property, as: 'units' }],
            transaction
        });

        if (!container) {
            throw new Error('Container not found');
        }

        if (!container.isContainer) {
            throw new Error('Property is not a container');
        }

        // Check if any units are already rented
        const rentedUnits = container.units.filter(unit => unit.isRented);
        if (rentedUnits.length > 0) {
            throw new Error('Cannot rent complete container: some units are already rented');
        }

        // Mark all units as rented
        await Property.update(
            { isRented: true },
            {
                where: { parentId: containerId },
                transaction
            }
        );

        // Update container
        await container.update({
            rentalMode: 'complete',
            availableUnits: 0,
            isRented: true
        }, { transaction });

        return container;
    } catch (error) {
        throw new Error(`Error renting complete container: ${error.message}`);
    }
};

/**
 * Change rental mode from complete to by_unit
 * @param {number} containerId - ID of the container
 * @param {Object} transaction - Sequelize transaction
 * @returns {Promise<Object>} Updated container
 */
export const changeToByUnitMode = async (containerId, transaction = null) => {
    try {
        const container = await Property.findByPk(containerId, {
            include: [{ model: Property, as: 'units' }],
            transaction
        });

        if (!container) {
            throw new Error('Container not found');
        }

        if (!container.isContainer) {
            throw new Error('Property is not a container');
        }

        // Mark all units as available
        await Property.update(
            { isRented: false },
            {
                where: { parentId: containerId },
                transaction
            }
        );

        // Update container
        await container.update({
            rentalMode: 'by_unit',
            availableUnits: container.totalUnits,
            isRented: false
        }, { transaction });

        return container;
    } catch (error) {
        throw new Error(`Error changing to by_unit mode: ${error.message}`);
    }
};

/**
 * Find container with all its units and associations
 * @param {number} containerId - ID of the container
 * @returns {Promise<Object>} Container with units
 */
export const findContainerWithUnits = async (containerId) => {
    try {
        const container = await Property.findByPk(containerId, {
            include: [
                {
                    model: Property,
                    as: 'units',
                    include: [
                        { model: PropertyImage, as: 'images' },
                        { model: Amenity, as: 'amenities' }
                    ]
                },
                { model: PropertyService, as: 'services' },
                { model: PropertyRule, as: 'rules' },
                { model: CommonArea, as: 'commonAreas' },
                {
                    model: Location,
                    as: 'location',
                    include: [
                        { model: City, as: 'city', attributes: ['id', 'name'] },
                        { model: Department, as: 'department', attributes: ['id', 'name'] }
                    ]
                },
                { model: Contact, as: 'contact' },
                { model: PropertyType, as: 'type' },
                { model: User, as: 'owner' }
            ]
        });

        if (!container) {
            throw new Error('Container not found');
        }

        if (!container.isContainer) {
            throw new Error('Property is not a container');
        }

        // Calculate unit statistics
        if (container.units) {
            const pendingUnits = container.units.filter(u => u.status === 'pending').length;
            const approvedUnits = container.units.filter(u => u.status === 'approved').length;
            const rejectedUnits = container.units.filter(u => u.status === 'rejected').length;

            container.dataValues.unitStats = {
                pending: pendingUnits,
                approved: approvedUnits,
                rejected: rejectedUnits,
                total: container.units.length
            };
        }

        return container;
    } catch (error) {
        throw new Error(`Error finding container: ${error.message}`);
    }
};

/**
 * Delete a unit and update container counts
 * @param {number} unitId - ID of the unit to delete
 * @param {Object} transaction - Sequelize transaction
 * @returns {Promise<boolean>} Success status
 */
export const deleteUnit = async (unitId, transaction = null) => {
    try {
        const unit = await Property.findByPk(unitId, { transaction });

        if (!unit) {
            throw new Error('Unit not found');
        }

        if (!unit.parentId) {
            throw new Error('Property is not a unit');
        }

        const containerId = unit.parentId;

        // Delete the unit
        await unit.destroy({ transaction });

        // Update container counts
        const container = await Property.findByPk(containerId, {
            include: [{ model: Property, as: 'units' }],
            transaction
        });

        if (container) {
            const availableCount = container.units.filter(u => !u.isRented).length;
            await container.update({
                totalUnits: container.units.length,
                availableUnits: availableCount
            }, { transaction });
        }

        return true;
    } catch (error) {
        throw new Error(`Error deleting unit: ${error.message}`);
    }
};

/**
 * Update unit rental status and container availability
 * @param {number} unitId - ID of the unit
 * @param {boolean} isRented - New rental status
 * @param {Object} transaction - Sequelize transaction
 * @returns {Promise<Object>} Updated unit
 */
export const updateUnitRentalStatus = async (unitId, isRented, transaction = null) => {
    try {
        const unit = await Property.findByPk(unitId, { transaction });

        if (!unit) {
            throw new Error('Unit not found');
        }

        if (!unit.parentId) {
            throw new Error('Property is not a unit');
        }

        // Update unit status
        await unit.update({ isRented }, { transaction });

        // Update container availability
        await updateContainerAvailability(unit.parentId, transaction);

        return unit;
    } catch (error) {
        throw new Error(`Error updating unit rental status: ${error.message}`);
    }
};

export default {
    createContainer,
    createUnit,
    updateContainerAvailability,
    rentCompleteContainer,
    changeToByUnitMode,
    findContainerWithUnits,
    deleteUnit,
    updateUnitRentalStatus
};
