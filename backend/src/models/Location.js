import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * Location Model
 * Stores property location information
 * N:1 relationship - multiple properties can share the same location (same building)
 */
const Location = sequelize.define('Location', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
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
    tableName: 'locations',
    underscored: true,
    timestamps: false,
    indexes: [
        {
            // Index for finding duplicate locations
            unique: true,
            fields: ['street', 'neighborhood', 'city']
        },
        {
            // Index for geospatial queries
            fields: ['latitude', 'longitude']
        }
    ]
});

export default Location;
