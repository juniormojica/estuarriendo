import { Property, User, Amenity, Notification } from '../models/index.js';
import { PropertyStatus, NotificationType, UserType } from '../utils/enums.js';
import { Op } from 'sequelize';
import * as propertyService from '../services/propertyService.js';

/**
 * Property Controller
 * Handles property CRUD operations, search, and status management
 */

// Get all properties with filters
export const getAllProperties = async (req, res) => {
    try {
        const {
            status,
            typeId,
            type,
            city,
            cityId,
            minPrice,
            maxPrice,
            minBedrooms,
            minBathrooms,
            amenities,
            ownerId,
            isFeatured,
            isRented,
            institutionId,
            institutionType,
            maxDistance,
            limit = 50,
            offset = 0
        } = req.query;

        // Convert city string to cityId if needed
        let resolvedCityId = cityId ? parseInt(cityId) : undefined;
        if (city && !resolvedCityId) {
            const { City } = await import('../models/index.js');
            const cityRecord = await City.findOne({ where: { name: city } });
            if (cityRecord) {
                resolvedCityId = cityRecord.id;
            }
        }

        // Convert type string to typeId if needed
        let resolvedTypeId = typeId ? parseInt(typeId) : undefined;
        if (type && !resolvedTypeId) {
            const { PropertyType } = await import('../models/index.js');
            const typeRecord = await PropertyType.findOne({ where: { name: type } });
            if (typeRecord) {
                resolvedTypeId = typeRecord.id;
            }
        }

        // Parse amenities array and convert to numbers
        let amenityIds = undefined;
        if (amenities) {
            const rawIds = typeof amenities === 'string'
                ? amenities.split(',').map(id => id.trim())
                : amenities;
            // Convert to numbers and filter out invalid IDs
            amenityIds = rawIds
                .map(id => {
                    const parsed = typeof id === 'string' ? parseInt(id) : id;
                    return isNaN(parsed) ? null : parsed;
                })
                .filter(id => id !== null);

            // If no valid IDs, set to undefined
            if (amenityIds.length === 0) {
                amenityIds = undefined;
            }
        }

        // Default to 'approved' status for public endpoint
        // This ensures only approved properties are shown on the homepage
        // Admin can override by explicitly passing status parameter
        // Use status='all' to fetch all properties regardless of status
        const filters = {
            status: status === 'all' ? undefined : (status || 'approved'),
            typeId: resolvedTypeId,
            cityId: resolvedCityId,
            minRent: minPrice ? parseFloat(minPrice) : undefined,
            maxRent: maxPrice ? parseFloat(maxPrice) : undefined,
            minBedrooms: minBedrooms ? parseInt(minBedrooms) : undefined,
            minBathrooms: minBathrooms ? parseInt(minBathrooms) : undefined,
            amenityIds,
            ownerId,
            isFeatured: isFeatured !== undefined ? isFeatured === 'true' : undefined,
            isRented: isRented !== undefined ? isRented === 'true' : undefined,
            // Institution filters
            institutionId: institutionId ? parseInt(institutionId) : undefined,
            institutionType,
            maxDistance: maxDistance ? parseInt(maxDistance) : undefined
        };

        const options = {
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [
                ['isFeatured', 'DESC'],
                ['createdAt', 'DESC']
            ]
        };

        const result = await propertyService.findPropertiesWithAssociations(filters, options);

        res.json({
            success: true,
            data: result.rows,
            count: result.count,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ error: 'Failed to fetch properties', message: error.message });
    }
};

// Get property by ID
export const getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;

        const property = await propertyService.findPropertyWithAssociations(id);

        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        // Increment views count
        await property.increment('viewsCount');

        res.json(property);
    } catch (error) {
        console.error('Error fetching property:', error);
        res.status(500).json({ error: 'Failed to fetch property', message: error.message });
    }
};

// Get properties by owner ID
export const getUserProperties = async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await propertyService.findPropertiesWithAssociations(
            { ownerId: userId },
            { order: [['createdAt', 'DESC']] }
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching user properties:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user properties',
            error: error.message
        });
    }
};

// Create new property
export const createProperty = async (req, res) => {
    try {
        const { ownerId, amenityIds, ...propertyData } = req.body;

        // Validate owner exists
        const owner = await User.findByPk(ownerId);
        if (!owner) {
            return res.status(404).json({ error: 'Owner not found' });
        }

        // Create property with all associations
        const property = await propertyService.createPropertyWithAssociations({
            ...propertyData,
            ownerId,
            status: PropertyStatus.PENDING,
            createdAt: new Date()
        });

        // Add amenities if provided (separate N:M relationship)
        if (amenityIds && Array.isArray(amenityIds) && amenityIds.length > 0) {
            const amenities = await Amenity.findAll({
                where: { id: amenityIds }
            });
            await Property.findByPk(property.id).then(p => p.setAmenities(amenities));
        }

        // Update owner's property count
        await owner.update({
            propertiesCount: owner.propertiesCount + 1,
            pendingCount: owner.pendingCount + 1
        });

        // Notify all admins about new property submission
        const admins = await User.findAll({
            where: {
                userType: {
                    [Op.in]: [UserType.ADMIN, UserType.SUPER_ADMIN]
                }
            }
        });

        for (const admin of admins) {
            await Notification.create({
                userId: admin.id,
                type: NotificationType.PROPERTY_SUBMITTED,
                title: 'Nueva propiedad pendiente de revisión',
                message: `${owner.name} ha enviado una nueva propiedad: "${property.title}"`,
                propertyId: property.id,
                isRead: false
            });
        }

        // Fetch complete property with all associations
        const completeProperty = await propertyService.findPropertyWithAssociations(property.id);

        res.status(201).json(completeProperty);
    } catch (error) {
        console.error('Error creating property:', error);
        res.status(500).json({ error: 'Failed to create property', message: error.message });
    }
};

// Update property
export const updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const { amenityIds, ...updates } = req.body;

        const property = await Property.findByPk(id);
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        // Update property with all associations
        const updatedProperty = await propertyService.updatePropertyWithAssociations(id, updates);

        // Update amenities if provided (separate N:M relationship)
        if (amenityIds && Array.isArray(amenityIds)) {
            const amenities = await Amenity.findAll({
                where: { id: amenityIds }
            });
            await Property.findByPk(id).then(p => p.setAmenities(amenities));
        }

        // Fetch updated property with all associations
        const completeProperty = await propertyService.findPropertyWithAssociations(id);

        res.json(completeProperty);
    } catch (error) {
        console.error('Error updating property:', error);
        res.status(500).json({ error: 'Failed to update property', message: error.message });
    }
};

// Delete property
export const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;

        const property = await Property.findByPk(id);
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        const ownerId = property.ownerId;
        const status = property.status;

        await propertyService.deleteProperty(id);

        // Update owner's property counts
        const owner = await User.findByPk(ownerId);
        if (owner) {
            const updates = {
                propertiesCount: Math.max(0, owner.propertiesCount - 1)
            };

            if (status === PropertyStatus.APPROVED) {
                updates.approvedCount = Math.max(0, owner.approvedCount - 1);
            } else if (status === PropertyStatus.PENDING) {
                updates.pendingCount = Math.max(0, owner.pendingCount - 1);
            } else if (status === PropertyStatus.REJECTED) {
                updates.rejectedCount = Math.max(0, owner.rejectedCount - 1);
            }

            await owner.update(updates);
        }

        res.json({ message: 'Property deleted successfully' });
    } catch (error) {
        console.error('Error deleting property:', error);
        res.status(500).json({ error: 'Failed to delete property', message: error.message });
    }
};

// Approve property (admin)
export const approveProperty = async (req, res) => {
    try {
        const { id } = req.params;

        const property = await Property.findByPk(id);
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        const oldStatus = property.status;

        await property.update({
            status: PropertyStatus.APPROVED,
            isVerified: true,
            reviewedAt: new Date(),
            rejectionReason: null
        });

        // Update owner counts
        const owner = await User.findByPk(property.ownerId);
        if (owner) {
            const updates = {};

            if (oldStatus === PropertyStatus.PENDING) {
                updates.pendingCount = Math.max(0, owner.pendingCount - 1);
                updates.approvedCount = owner.approvedCount + 1;
            } else if (oldStatus === PropertyStatus.REJECTED) {
                updates.rejectedCount = Math.max(0, owner.rejectedCount - 1);
                updates.approvedCount = owner.approvedCount + 1;
            }

            if (Object.keys(updates).length > 0) {
                await owner.update(updates);
            }
        }

        // Notify owner about property approval
        await Notification.create({
            userId: property.ownerId,
            type: NotificationType.PROPERTY_APPROVED,
            title: '¡Propiedad aprobada!',
            message: `Tu propiedad "${property.title}" ha sido aprobada y ya está visible para estudiantes.`,
            propertyId: property.id,
            isRead: false
        });

        // Fetch complete property with all associations
        const completeProperty = await propertyService.findPropertyWithAssociations(id);

        res.json({
            success: true,
            message: 'Property approved successfully',
            data: completeProperty
        });
    } catch (error) {
        console.error('Error approving property:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to approve property',
            message: error.message
        });
    }
};

// Reject property (admin)
export const rejectProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({ error: 'Rejection reason is required' });
        }

        const property = await Property.findByPk(id);
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        const oldStatus = property.status;

        await property.update({
            status: PropertyStatus.REJECTED,
            isVerified: false,
            reviewedAt: new Date(),
            rejectionReason: reason
        });

        // Update owner counts
        const owner = await User.findByPk(property.ownerId);
        if (owner) {
            const updates = {};

            if (oldStatus === PropertyStatus.PENDING) {
                updates.pendingCount = Math.max(0, owner.pendingCount - 1);
                updates.rejectedCount = owner.rejectedCount + 1;
            } else if (oldStatus === PropertyStatus.APPROVED) {
                updates.approvedCount = Math.max(0, owner.approvedCount - 1);
                updates.rejectedCount = owner.rejectedCount + 1;
            }

            if (Object.keys(updates).length > 0) {
                await owner.update(updates);
            }
        }

        // Notify owner about property rejection
        await Notification.create({
            userId: property.ownerId,
            type: NotificationType.PROPERTY_REJECTED,
            title: 'Propiedad rechazada',
            message: `Tu propiedad "${property.title}" ha sido rechazada. Motivo: ${reason}`,
            propertyId: property.id,
            isRead: false
        });

        // Fetch complete property with all associations
        const completeProperty = await propertyService.findPropertyWithAssociations(id);

        res.json({
            success: true,
            message: 'Property rejected',
            data: completeProperty
        });
    } catch (error) {
        console.error('Error rejecting property:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to reject property',
            message: error.message
        });
    }
};

// Toggle featured status
export const toggleFeatured = async (req, res) => {
    try {
        const { id } = req.params;

        const property = await Property.findByPk(id);
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        await property.update({
            isFeatured: !property.isFeatured
        });

        // Fetch complete property with all associations
        const completeProperty = await propertyService.findPropertyWithAssociations(id);

        res.json({
            success: true,
            message: `Property ${completeProperty.isFeatured ? 'featured' : 'unfeatured'} successfully`,
            data: completeProperty
        });
    } catch (error) {
        console.error('Error toggling featured status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to toggle featured status',
            message: error.message
        });
    }
};

// Mark property as rented/available
export const toggleRentedStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const property = await Property.findByPk(id);
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        await property.update({
            isRented: !property.isRented
        });

        // Fetch complete property with all associations
        const completeProperty = await propertyService.findPropertyWithAssociations(id);

        res.json({
            success: true,
            message: `Property marked as ${completeProperty.isRented ? 'rented' : 'available'}`,
            data: completeProperty
        });
    } catch (error) {
        console.error('Error toggling rented status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to toggle rented status',
            message: error.message
        });
    }
};

export default {
    getAllProperties,
    getPropertyById,
    getUserProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    approveProperty,
    rejectProperty,
    toggleFeatured,
    toggleRentedStatus
};
