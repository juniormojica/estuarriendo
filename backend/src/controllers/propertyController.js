import { Property, User, Amenity } from '../models/index.js';
import { PropertyStatus } from '../utils/enums.js';
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
            city,
            minPrice,
            maxPrice,
            ownerId,
            isFeatured,
            isRented,
            limit = 50,
            offset = 0
        } = req.query;

        const filters = {
            status,
            typeId: typeId ? parseInt(typeId) : undefined,
            city,
            minRent: minPrice ? parseFloat(minPrice) : undefined,
            maxRent: maxPrice ? parseFloat(maxPrice) : undefined,
            ownerId,
            isFeatured: isFeatured !== undefined ? isFeatured === 'true' : undefined,
            isRented: isRented !== undefined ? isRented === 'true' : undefined
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
