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
    cityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'city_id',
        references: {
            model: 'cities',
            key: 'id'
        },
        onDelete: 'RESTRICT',
        comment: 'City where property is located'
    },
    departmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'department_id',
        references: {
            model: 'departments',
            key: 'id'
        },
        onDelete: 'RESTRICT',
        comment: 'Department where property is located'
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
            fields: ['street', 'neighborhood', 'city_id']
        },
        {
            // Index for geospatial queries
            fields: ['latitude', 'longitude']
        },
        {
            // Index for filtering by city
            fields: ['city_id']
        },
        {
            // Index for filtering by department
            fields: ['department_id']
        }
    ]
});

export default Location;
