import {
    Property,
    Location,
    Contact,
    PropertyFeature,
    PropertyImage,
    PropertyType,
    Institution,
    PropertyInstitution,
    Amenity,
    User,
    sequelize
} from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Property Service
 * Handles complex property operations with nested associations
 */

/**
 * Find or create a location
 * Prevents duplicate locations for properties in the same building
 */
export const findOrCreateLocation = async (locationData, transaction = null) => {
    const { street, neighborhood, cityId, departmentId, zipCode, latitude, longitude } = locationData;

    // Try to find existing location
    const [location, created] = await Location.findOrCreate({
        where: {
            street,
            neighborhood,
            cityId
        },
        defaults: {
            departmentId,
            zipCode,
            latitude,
            longitude
        },
        transaction
    });

    return location;
};

/**
 * Create property with all associations
 * Handles: location, contact, features, images, institutions
 */
export const createPropertyWithAssociations = async (propertyData) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            // Property type (can be ID or name)
            typeId,
            typeName,
            // Location data
            location: locationData,
            // Contact data
            contact: contactData,
            // Features data
            features: featuresData,
            // Images data
            images: imagesData = [],
            // Institutions data
            institutions: institutionsData = [],
            // Property core data
            ...corePropertyData
        } = propertyData;

        // Resolve property type ID
        let resolvedTypeId = typeId;

        // If typeName is provided, look it up in the database
        if (typeName && !typeId) {
            const propertyType = await PropertyType.findOne({
                where: { name: typeName }
            });

            if (!propertyType) {
                throw new Error(`Tipo de propiedad no válido: ${typeName}. Los tipos válidos son: pension, habitacion, apartamento, aparta-estudio`);
            }

            resolvedTypeId = propertyType.id;
        }

        // Validate that we have a type ID
        if (!resolvedTypeId) {
            throw new Error('Se requiere typeId o typeName para crear una propiedad');
        }

        // Verify the type ID exists
        const typeExists = await PropertyType.findByPk(resolvedTypeId);
        if (!typeExists) {
            throw new Error(`El tipo de propiedad con ID ${resolvedTypeId} no existe en la base de datos`);
        }

        // 1. Find or create location (N:1 - reuse if exists)
        const location = await findOrCreateLocation(locationData, transaction);

        // 2. Create the property
        const property = await Property.create({
            ...corePropertyData,
            typeId: resolvedTypeId,
            locationId: location.id
        }, { transaction });

        // 3. Create contact (1:1)
        if (contactData) {
            await Contact.create({
                propertyId: property.id,
                ...contactData
            }, { transaction });
        }

        // 4. Create features (1:1)
        if (featuresData) {
            await PropertyFeature.create({
                propertyId: property.id,
                isFurnished: featuresData.isFurnished || false,
                hasParking: featuresData.hasParking || false,
                allowsPets: featuresData.allowsPets || false
            }, { transaction });
        }

        // 5. Create images (1:N)
        if (imagesData && imagesData.length > 0) {
            const imageRecords = imagesData.map((img, index) => ({
                propertyId: property.id,
                url: typeof img === 'string' ? img : img.url,
                isFeatured: typeof img === 'string' ? index === 0 : (img.isFeatured || index === 0),
                orderPosition: typeof img === 'string' ? index : (img.orderPosition || index)
            }));

            await PropertyImage.bulkCreate(imageRecords, { transaction });
        }

        // 6. Associate institutions (N:M)
        if (institutionsData && institutionsData.length > 0) {
            // institutionsData can be array of IDs or array of objects with {id, distance}
            const institutionAssociations = institutionsData.map(inst => ({
                propertyId: property.id,
                institutionId: typeof inst === 'number' ? inst : inst.id,
                distance: typeof inst === 'object' ? inst.distance : null
            }));

            await PropertyInstitution.bulkCreate(institutionAssociations, { transaction });
        }

        await transaction.commit();

        // Return property with all associations
        return await findPropertyWithAssociations(property.id);

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Update property with all associations
 */
export const updatePropertyWithAssociations = async (propertyId, updateData) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            // Nested data
            location: locationData,
            contact: contactData,
            features: featuresData,
            images: imagesData,
            institutions: institutionsData,
            // Core property data
            ...corePropertyData
        } = updateData;

        // 1. Update location if provided
        if (locationData) {
            const location = await findOrCreateLocation(locationData, transaction);
            corePropertyData.locationId = location.id;
        }

        // Check if property is currently rejected and reset status to pending
        const currentProperty = await Property.findByPk(propertyId);
        if (currentProperty && currentProperty.status === 'rejected') {
            // Reset status to pending when a rejected property is updated
            corePropertyData.status = 'pending';
            corePropertyData.rejectionReason = null; // Clear rejection reason
        }

        // 2. Update core property data
        if (Object.keys(corePropertyData).length > 0) {
            await Property.update(corePropertyData, {
                where: { id: propertyId },
                transaction
            });
        }

        // 3. Update contact if provided
        if (contactData) {
            await Contact.update(contactData, {
                where: { propertyId },
                transaction
            });
        }

        // 4. Update features if provided
        if (featuresData) {
            await PropertyFeature.update(featuresData, {
                where: { propertyId },
                transaction
            });
        }

        // 5. Update images if provided (delete old, create new)
        if (imagesData) {
            await PropertyImage.destroy({
                where: { propertyId },
                transaction
            });

            if (imagesData.length > 0) {
                const imageRecords = imagesData.map((img, index) => ({
                    propertyId,
                    url: typeof img === 'string' ? img : img.url,
                    isFeatured: typeof img === 'string' ? index === 0 : (img.isFeatured || index === 0),
                    orderPosition: typeof img === 'string' ? index : (img.orderPosition || index)
                }));

                await PropertyImage.bulkCreate(imageRecords, { transaction });
            }
        }

        // 6. Update institutions if provided (delete old, create new)
        if (institutionsData) {
            await PropertyInstitution.destroy({
                where: { propertyId },
                transaction
            });

            if (institutionsData.length > 0) {
                const institutionAssociations = institutionsData.map(inst => ({
                    propertyId,
                    institutionId: typeof inst === 'number' ? inst : inst.id,
                    distance: typeof inst === 'object' ? inst.distance : null
                }));

                await PropertyInstitution.bulkCreate(institutionAssociations, { transaction });
            }
        }

        await transaction.commit();

        // Return updated property with all associations
        return await findPropertyWithAssociations(propertyId);

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Find property with all associations
 */
export const findPropertyWithAssociations = async (propertyId) => {
    return await Property.findByPk(propertyId, {
        include: [
            {
                model: User,
                as: 'owner',
                attributes: ['id', 'email', 'name', 'userType', 'plan', 'verificationStatus']
            },
            {
                model: Location,
                as: 'location'
            },
            {
                model: Contact,
                as: 'contact'
            },
            {
                model: PropertyFeature,
                as: 'features'
            },
            {
                model: PropertyImage,
                as: 'images',
                order: [['orderPosition', 'ASC']]
            },
            {
                model: PropertyType,
                as: 'type'
            },
            {
                model: Institution,
                as: 'institutions',
                through: {
                    attributes: ['distance']
                }
            },
            {
                model: Amenity,
                as: 'amenities',
                through: {
                    attributes: []
                }
            }
        ]
    });
};

/**
 * Find all properties with associations and filters
 */
export const findPropertiesWithAssociations = async (filters = {}, options = {}) => {
    const {
        status,
        ownerId,
        typeId,
        cityId,
        minRent,
        maxRent,
        minBedrooms,
        minBathrooms,
        amenityIds,
        isFeatured,
        isRented,
        institutionId,
        institutionType,
        maxDistance
    } = filters;

    const {
        limit = 50,
        offset = 0,
        order = [['createdAt', 'DESC']]
    } = options;

    const where = {};

    if (status) where.status = status;
    if (ownerId) where.ownerId = ownerId;
    if (typeId) where.typeId = typeId;
    if (minRent) where.monthlyRent = { ...where.monthlyRent, [Op.gte]: minRent };
    if (maxRent) where.monthlyRent = { ...where.monthlyRent, [Op.lte]: maxRent };
    if (minBedrooms) where.bedrooms = { [Op.gte]: minBedrooms };
    if (minBathrooms) where.bathrooms = { [Op.gte]: minBathrooms };
    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (isRented !== undefined) where.isRented = isRented;

    const include = [
        {
            model: User,
            as: 'owner',
            attributes: ['id', 'email', 'name', 'userType', 'plan', 'verificationStatus']
        },
        {
            model: Location,
            as: 'location',
            ...(cityId && { where: { cityId } })
        },
        {
            model: Contact,
            as: 'contact'
        },
        {
            model: PropertyFeature,
            as: 'features'
        },
        {
            model: PropertyImage,
            as: 'images'
        },
        {
            model: PropertyType,
            as: 'type'
        }
    ];

    // Amenities filtering - AND logic (property must have ALL selected amenities)
    if (amenityIds && amenityIds.length > 0) {
        // Use a subquery to find properties that have ALL selected amenities
        // This is done by grouping by property and counting matching amenities
        const { PropertyAmenity } = await import('../models/index.js');

        // Get property IDs that have ALL the selected amenities
        const propertiesWithAllAmenities = await PropertyAmenity.findAll({
            attributes: ['propertyId'],
            where: {
                amenityId: { [Op.in]: amenityIds }
            },
            group: ['propertyId'],
            having: sequelize.literal(`COUNT(DISTINCT amenity_id) = ${amenityIds.length}`),
            raw: true
        });

        const propertyIdsWithAllAmenities = propertiesWithAllAmenities.map(p => p.propertyId);

        // Add to where clause
        if (propertyIdsWithAllAmenities.length > 0) {
            where.id = { [Op.in]: propertyIdsWithAllAmenities };
        } else {
            // No properties have all the selected amenities
            where.id = { [Op.in]: [] }; // This will return no results
        }

        // Still include amenities in the result for display
        include.push({
            model: Amenity,
            as: 'amenities',
            through: {
                attributes: []
            }
        });
    } else {
        // Include all amenities (LEFT JOIN)
        include.push({
            model: Amenity,
            as: 'amenities',
            through: {
                attributes: []
            }
        });
    }

    // Institution filtering
    if (institutionId || institutionType || maxDistance) {
        const institutionInclude = {
            model: Institution,
            as: 'institutions',
            through: {
                attributes: ['distance']
            }
        };

        // Build where clause for institution
        const institutionWhere = {};
        if (institutionId) {
            institutionWhere.id = institutionId;
        }
        if (institutionType) {
            institutionWhere.type = institutionType;
        }

        if (Object.keys(institutionWhere).length > 0) {
            institutionInclude.where = institutionWhere;
        }

        // Filter by distance in junction table
        if (maxDistance) {
            institutionInclude.through.where = {
                distance: { [Op.lte]: maxDistance }
            };
        }

        // Make it required (INNER JOIN) so only properties with matching institutions are returned
        institutionInclude.required = true;

        include.push(institutionInclude);
    } else {
        // Include institutions but not required (LEFT JOIN)
        include.push({
            model: Institution,
            as: 'institutions',
            through: {
                attributes: ['distance']
            }
        });
    }

    return await Property.findAndCountAll({
        where,
        include,
        limit,
        offset,
        order,
        distinct: true
    });
};

/**
 * Delete property (cascades to all related tables)
 */
export const deleteProperty = async (propertyId) => {
    return await Property.destroy({
        where: { id: propertyId }
    });
};
