import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { PropertyStatus, getEnumValues } from '../utils/enums.js';

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
    typeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'type_id',
        references: {
            model: 'property_types',
            key: 'id'
        },
        comment: 'Foreign key to property_types table'
    },
    locationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'location_id',
        references: {
            model: 'locations',
            key: 'id'
        },
        comment: 'Foreign key to locations table'
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
