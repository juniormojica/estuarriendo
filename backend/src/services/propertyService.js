import {
    Property,
    Location,
    Contact,
    PropertyFeature,
    PropertyImage,
    PropertyType,
    Institution,
    PropertyInstitution,
    User,
    sequelize
} from '../models/index.js';

/**
 * Property Service
 * Handles complex property operations with nested associations
 */

/**
 * Find or create a location
 * Prevents duplicate locations for properties in the same building
 */
export const findOrCreateLocation = async (locationData, transaction = null) => {
    const { street, neighborhood, city, department, zipCode, latitude, longitude } = locationData;

    // Try to find existing location
    const [location, created] = await Location.findOrCreate({
        where: {
            street,
            neighborhood,
            city
        },
        defaults: {
            department,
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
            // Property type
            typeId,
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

        // 1. Find or create location (N:1 - reuse if exists)
        const location = await findOrCreateLocation(locationData, transaction);

        // 2. Create the property
        const property = await Property.create({
            ...corePropertyData,
            typeId,
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
                attributes: ['id', 'email', 'name', 'userType']
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
        city,
        minRent,
        maxRent,
        isFeatured,
        isRented
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
    if (minRent) where.monthlyRent = { ...where.monthlyRent, [sequelize.Op.gte]: minRent };
    if (maxRent) where.monthlyRent = { ...where.monthlyRent, [sequelize.Op.lte]: maxRent };
    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (isRented !== undefined) where.isRented = isRented;

    const include = [
        {
            model: User,
            as: 'owner',
            attributes: ['id', 'email', 'name', 'userType']
        },
        {
            model: Location,
            as: 'location',
            ...(city && { where: { city } })
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
        },
        {
            model: Institution,
            as: 'institutions',
            through: {
                attributes: ['distance']
            }
        }
    ];

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
