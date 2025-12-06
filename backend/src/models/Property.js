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
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM(...getEnumValues(PropertyType)),
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'COP'
    },
    status: {
        type: DataTypes.ENUM(...getEnumValues(PropertyStatus)),
        allowNull: false,
        defaultValue: PropertyStatus.PENDING
    },

    // JSONB Structures
    address: {
        type: DataTypes.JSONB,
        allowNull: false,
        comment: 'Address interface: { street, neighborhood, city, department, zipCode }'
    },
    coordinates: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Coordinates interface: { lat, lng }'
    },

    // Optional Fields
    rooms: {
        type: DataTypes.SMALLINT,
        allowNull: true
    },
    bathrooms: {
        type: DataTypes.SMALLINT,
        allowNull: true
    },
    area: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Area in square meters'
    },
    images: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: false,
        defaultValue: [],
        comment: 'Array of image URLs'
    },
    nearbyUniversities: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: true,
        field: 'nearby_universities',
        comment: 'Array of nearby university names'
    },

    // Flags
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
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'rejection_reason'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    }
}, {
    tableName: 'properties',
    underscored: true,
    timestamps: false
});

export default Property;
