import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { PropertyType, PropertyStatus, getEnumValues } from '../utils/enums.js';

/**
 * Property Model
 * Represents property listings (pension, habitacion, apartamento, aparta-estudio)
 */
const Property = sequelize.define('Property', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ownerId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'owner_id',
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    type: {
        type: DataTypes.ENUM(...getEnumValues(PropertyType)),
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    // Pricing
    monthlyRent: {
        type: DataTypes.DECIMAL(15, 0),
        allowNull: false,
        field: 'monthly_rent',
        comment: 'Monthly rent amount'
    },
    deposit: {
        type: DataTypes.DECIMAL(15, 0),
        allowNull: true,
        comment: 'Security deposit amount'
    },
    currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'COP'
    },

    // Address fields (simplified from JSONB)
    street: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Street address'
    },
    neighborhood: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Neighborhood/locality'
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'Bogotá'
    },
    department: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: 'Cundinamarca'
    },
    zipCode: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'zip_code'
    },

    // Coordinates (simplified from JSONB)
    latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
        comment: 'Latitude coordinate'
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
        comment: 'Longitude coordinate'
    },

    // Property characteristics
    bedrooms: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        comment: 'Number of bedrooms'
    },
    bathrooms: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        comment: 'Number of bathrooms'
    },
    area: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Area in square meters'
    },
    floor: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        comment: 'Floor number'
    },

    // Amenities/Features
    allowsPets: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'allows_pets'
    },
    isFurnished: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_furnished'
    },
    hasParking: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'has_parking'
    },

    // Media
    images: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: false,
        defaultValue: [],
        comment: 'Array of image URLs'
    },

    // Nearby universities
    nearbyUniversities: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: true,
        field: 'nearby_universities',
        comment: 'Array of nearby university names'
    },

    // Contact information
    contactName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'contact_name'
    },
    contactPhone: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'contact_phone'
    },
    contactEmail: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'contact_email'
    },
    contactWhatsapp: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'contact_whatsapp'
    },

    // Availability
    availableFrom: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'available_from',
        comment: 'Date when property becomes available'
    },

    // Status and verification
    status: {
        type: DataTypes.ENUM(...getEnumValues(PropertyStatus)),
        allowNull: false,
        defaultValue: PropertyStatus.PENDING
    },
    isFeatured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_featured'
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_verified'
    },
    isRented: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_rented'
    },

    // Review process
    submittedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'submitted_at',
        comment: 'When property was submitted for review'
    },
    reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'reviewed_at',
        comment: 'When property was reviewed by admin'
    },
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'rejection_reason'
    },

    // Metrics
    viewsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'views_count',
        comment: 'Number of times property was viewed'
    },
    interestsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'interests_count',
        comment: 'Number of interest expressions'
    },

    // Timestamps
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'updated_at'
    }
}, {
    tableName: 'properties',
    underscored: true,
    timestamps: false
});

export default Property;
