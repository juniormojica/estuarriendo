import { Property, User, Amenity, Notification, ActivityLog } from '../models/index.js';
import { PropertyStatus, NotificationType, UserType } from '../utils/enums.js';
import { badRequest, notFound } from '../errors/AppError.js';
import { Op } from 'sequelize';
import * as propertyService from '../services/propertyService.js';

/**
 * Property Controller
 * Handles property CRUD operations, search, and status management
 */

// Get all properties with filters
export const getAllProperties = async (req, res, next) => {
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
        next(error);
    }
};

// Get property by ID
export const getPropertyById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { lightweight } = req.query;

        const property = lightweight === 'true' 
            ? await propertyService.findPropertyLightweight(id)
            : await propertyService.findPropertyWithAssociations(id);

        if (!property) {
            return next(notFound('Propiedad no encontrada', { code: 'PROPERTY_NOT_FOUND' }));
        }

        // Increment views count
        await property.increment('viewsCount');

        // Log activity only if featured and user is logged in
        if (property.isFeatured && req.userId) {
            await ActivityLog.create({
                type: 'property_featured',
                message: `Propiedad destacada: ${property.title}`,
                userId: req.userId,
                propertyId: property.id,
                timestamp: new Date()
            });
        }

        res.json(property);
    } catch (error) {
        next(error);
    }
};

// Get properties by owner ID
export const getUserProperties = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Import necessary models
        const { PropertyImage, Amenity } = await import('../models/index.js');

        const result = await propertyService.findPropertiesWithAssociations(
            { ownerId: userId },
            {
                order: [['createdAt', 'DESC']],
                // Include units for containers
                includeUnits: true
            }
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        next(error);
    }
};

// Create new property
export const createProperty = async (req, res, next) => {
    try {
        const { ownerId, amenityIds, services, rules, nearbyInstitutions, ...propertyData } = req.body;

        // Validate owner exists
        const owner = await User.findByPk(ownerId);
        if (!owner) {
            return next(notFound('Propietario no encontrado', { code: 'OWNER_NOT_FOUND' }));
        }

        // Validate images
        const images = propertyData.images;
        if (!images || !Array.isArray(images) || images.length === 0) {
            return next(badRequest('Debes agregar al menos una imagen de la propiedad', { code: 'PROPERTY_IMAGES_REQUIRED' }));
        }

        // Validate maximum images limit
        if (images.length > 10) {
            return next(badRequest('El máximo de imágenes permitidas es 10', { code: 'PROPERTY_IMAGES_LIMIT_EXCEEDED' }));
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

        // Add services if provided (for pension type)
        if (services && Array.isArray(services) && services.length > 0) {
            const { PropertyService } = await import('../models/index.js');
            for (const service of services) {
                if (service.serviceType && service.isIncluded !== undefined) {
                    await PropertyService.create({
                        propertyId: property.id,
                        serviceType: service.serviceType,
                        isIncluded: service.isIncluded,
                        additionalCost: service.additionalCost || null,
                        description: service.description || null
                    });
                }
            }
        }

        // Add rules if provided (for habitacion and pension types)
        if (rules && Array.isArray(rules) && rules.length > 0) {
            const { PropertyRule } = await import('../models/index.js');
            for (const rule of rules) {
                if (rule.ruleType && rule.isAllowed !== undefined) {
                    await PropertyRule.create({
                        propertyId: property.id,
                        ruleType: rule.ruleType,
                        isAllowed: rule.isAllowed,
                        value: rule.value || null,
                        description: rule.description || null
                    });
                }
            }
        }

        // Add nearby institutions if provided
        if (nearbyInstitutions && Array.isArray(nearbyInstitutions) && nearbyInstitutions.length > 0) {
            const { PropertyInstitution } = await import('../models/index.js');
            for (const ni of nearbyInstitutions) {
                if (ni.institutionId) {
                    await PropertyInstitution.create({
                        propertyId: property.id,
                        institutionId: ni.institutionId,
                        distance: ni.distance || null
                    });
                }
            }
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
                message: `${owner.name} ha enviado una nueva propiedad: \"${property.title}\"`,
                propertyId: property.id,
                isRead: false
            });
        }

        // Fetch complete property with all associations
        const completeProperty = await propertyService.findPropertyWithAssociations(property.id);

        // Log activity
        await ActivityLog.create({
            type: 'property_submitted',
            message: `Nueva propiedad enviada por ${owner.name}: ${property.title}`,
            userId: owner.id,
            propertyId: property.id,
            timestamp: new Date()
        });

        res.status(201).json(completeProperty);
    } catch (error) {
        next(error);
    }
};

// Update property
export const updateProperty = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amenityIds, ...updates } = req.body;

        const property = await Property.findByPk(id);
        if (!property) {
            return next(notFound('Propiedad no encontrada', { code: 'PROPERTY_NOT_FOUND' }));
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

        if (updates.status === PropertyStatus.PENDING) {
            await ActivityLog.create({
                type: 'property_updated',
                message: `Propiedad actualizada y enviada a revisión: ${property.title}`,
                userId: req.userId || property.ownerId,
                propertyId: property.id,
                timestamp: new Date()
            });
        }

        res.json(completeProperty);
    } catch (error) {
        next(error);
    }
};

// Delete property
export const deleteProperty = async (req, res, next) => {
    try {
        const { id } = req.params;

        const property = await Property.findByPk(id);
        if (!property) {
            return next(notFound('Propiedad no encontrada', { code: 'PROPERTY_NOT_FOUND' }));
        }

        const ownerId = property.ownerId;
        const status = property.status;

        // Log activity before deletion
        await ActivityLog.create({
            type: 'property_deleted',
            message: `Propiedad eliminada: ${property.title} (ID: ${id})`,
            userId: req.userId, // Admin who deleted
            propertyId: null, // Don't link since it's being deleted
            timestamp: new Date()
        });

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

            if (Object.keys(updates).length > 0) {
                await owner.update(updates);
            }
        }

        res.json({ message: 'Propiedad eliminada exitosamente' });
    } catch (error) {
        next(error);
    }
};

// Approve property (admin)
export const approveProperty = async (req, res, next) => {
    try {
        const { id } = req.params;

        const property = await Property.findByPk(id);
        if (!property) {
            return next(notFound('Propiedad no encontrada', { code: 'PROPERTY_NOT_FOUND' }));
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
        try {
            await Notification.create({
                userId: property.ownerId,
                type: NotificationType.PROPERTY_APPROVED,
                title: '¡Propiedad aprobada!',
                message: `Tu propiedad "${property.title}" ha sido aprobada y ya está visible para estudiantes.`,
                propertyId: property.id,
                isRead: false
            });
        } catch (notifError) {
            console.warn('Failed to send approval notification:', notifError);
            // Continue execution, approval was successful
        }

        // Fetch complete property with all associations
        const completeProperty = await propertyService.findPropertyWithAssociations(id);

        // Log activity
        await ActivityLog.create({
            type: 'property_approved',
            message: `Propiedad aprobada: ${property.title}`,
            userId: req.userId,
            propertyId: property.id,
            timestamp: new Date()
        });

        res.json({
            success: true,
            message: 'Propiedad aprobada exitosamente',
            data: completeProperty
        });
    } catch (error) {
        next(error);
    }
};

// Reject property (admin)
export const rejectProperty = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return next(badRequest('El motivo de rechazo es requerido', { code: 'REJECTION_REASON_REQUIRED' }));
        }

        const property = await Property.findByPk(id);
        if (!property) {
            return next(notFound('Propiedad no encontrada', { code: 'PROPERTY_NOT_FOUND' }));
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

        // Log activity
        await ActivityLog.create({
            type: 'property_rejected',
            message: `Propiedad rechazada: ${property.title}. Razón: ${reason}`,
            userId: req.userId,
            propertyId: property.id,
            timestamp: new Date()
        });

        res.json({
            success: true,
            message: 'Propiedad rechazada',
            data: completeProperty
        });
    } catch (error) {
        next(error);
    }
};

// Toggle featured status
export const toggleFeatured = async (req, res, next) => {
    try {
        const { id } = req.params;

        const property = await Property.findByPk(id);
        if (!property) {
            return next(notFound('Propiedad no encontrada', { code: 'PROPERTY_NOT_FOUND' }));
        }

        await property.update({
            isFeatured: !property.isFeatured
        });

        // Fetch complete property with all associations
        const completeProperty = await propertyService.findPropertyWithAssociations(id);

        // Log activity if featured
        if (completeProperty.isFeatured) {
            await ActivityLog.create({
                type: 'property_featured',
                message: `Propiedad destacada: ${completeProperty.title}`,
                userId: req.user.id,
                propertyId: completeProperty.id,
                timestamp: new Date()
            });
        }

        res.json({
            success: true,
            message: `Propiedad ${completeProperty.isFeatured ? 'destacada' : 'no destacada'} exitosamente`,
            data: completeProperty
        });
    } catch (error) {
        next(error);
    }
};

// Mark property as rented/available
export const toggleRentedStatus = async (req, res, next) => {
    try {
        const { id } = req.params;

        const property = await Property.findByPk(id);
        if (!property) {
            return next(notFound('Propiedad no encontrada', { code: 'PROPERTY_NOT_FOUND' }));
        }

        await property.update({
            isRented: !property.isRented
        });

        // Fetch complete property with all associations
        const completeProperty = await propertyService.findPropertyWithAssociations(id);

        res.json({
            success: true,
            message: `Propiedad marcada como ${completeProperty.isRented ? 'alquilada' : 'disponible'}`,
            data: completeProperty
        });
    } catch (error) {
        next(error);
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
