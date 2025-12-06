import { Property, User, Amenity, PropertyAmenity } from '../models/index.js';
import { PropertyStatus } from '../utils/enums.js';
import { Op } from 'sequelize';

/**
 * Property Controller
 * Handles property CRUD operations, search, and status management
 */

// Get all properties with filters
export const getAllProperties = async (req, res) => {
    try {
        const {
            status,
            type,
            city,
            minPrice,
            maxPrice,
            ownerId,
            isFeatured,
            isRented,
            limit = 50,
            offset = 0
        } = req.query;

        const where = {};

        if (status) where.status = status;
        if (type) where.type = type;
        if (ownerId) where.ownerId = ownerId;
        if (isFeatured !== undefined) where.isFeatured = isFeatured === 'true';
        if (isRented !== undefined) where.isRented = isRented === 'true';

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
        }

        if (city) {
            where['address.city'] = city;
        }

        const properties = await Property.findAll({
            where,
            include: [
                {
                    model: User,
                    as: 'owner',
                    attributes: ['id', 'name', 'email', 'phone', 'whatsapp', 'isVerified']
                },
                {
                    model: Amenity,
                    as: 'amenities',
                    through: { attributes: [] }
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [
                ['isFeatured', 'DESC'],
                ['createdAt', 'DESC']
            ]
        });

        res.json(properties);
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ error: 'Failed to fetch properties', message: error.message });
    }
};

// Get property by ID
export const getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;

        const property = await Property.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'owner',
                    attributes: ['id', 'name', 'email', 'phone', 'whatsapp', 'isVerified', 'plan']
                },
                {
                    model: Amenity,
                    as: 'amenities',
                    through: { attributes: [] }
                }
            ]
        });

        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        res.json(property);
    } catch (error) {
        console.error('Error fetching property:', error);
        res.status(500).json({ error: 'Failed to fetch property', message: error.message });
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

        // Create property
        const property = await Property.create({
            ...propertyData,
            ownerId,
            status: PropertyStatus.PENDING,
            createdAt: new Date()
        });

        // Add amenities if provided
        if (amenityIds && Array.isArray(amenityIds) && amenityIds.length > 0) {
            const amenities = await Amenity.findAll({
                where: { id: amenityIds }
            });
            await property.setAmenities(amenities);
        }

        // Update owner's property count
        await owner.update({
            propertiesCount: owner.propertiesCount + 1,
            pendingCount: owner.pendingCount + 1
        });

        // Fetch complete property with associations
        const completeProperty = await Property.findByPk(property.id, {
            include: [
                {
                    model: User,
                    as: 'owner',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Amenity,
                    as: 'amenities'
                }
            ]
        });

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

        await property.update(updates);

        // Update amenities if provided
        if (amenityIds && Array.isArray(amenityIds)) {
            const amenities = await Amenity.findAll({
                where: { id: amenityIds }
            });
            await property.setAmenities(amenities);
        }

        // Fetch updated property with associations
        const updatedProperty = await Property.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'owner',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Amenity,
                    as: 'amenities'
                }
            ]
        });

        res.json(updatedProperty);
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

        await property.destroy();

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

        res.json({
            message: 'Property approved successfully',
            property
        });
    } catch (error) {
        console.error('Error approving property:', error);
        res.status(500).json({ error: 'Failed to approve property', message: error.message });
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

        res.json({
            message: 'Property rejected',
            property
        });
    } catch (error) {
        console.error('Error rejecting property:', error);
        res.status(500).json({ error: 'Failed to reject property', message: error.message });
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

        res.json({
            message: `Property ${property.isFeatured ? 'featured' : 'unfeatured'} successfully`,
            property
        });
    } catch (error) {
        console.error('Error toggling featured status:', error);
        res.status(500).json({ error: 'Failed to toggle featured status', message: error.message });
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

        res.json({
            message: `Property marked as ${property.isRented ? 'rented' : 'available'}`,
            property
        });
    } catch (error) {
        console.error('Error toggling rented status:', error);
        res.status(500).json({ error: 'Failed to toggle rented status', message: error.message });
    }
};

export default {
    getAllProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    approveProperty,
    rejectProperty,
    toggleFeatured,
    toggleRentedStatus
};
