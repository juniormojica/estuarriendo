import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * PropertyAmenity Model
 * Junction table for many-to-many relationship between Properties and Amenities
 */
const PropertyAmenity = sequelize.define('PropertyAmenity', {
    propertyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        field: 'property_id',
        references: {
            model: 'properties',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    amenityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        field: 'amenity_id',
        references: {
            model: 'amenities',
            key: 'id'
        },
        onDelete: 'CASCADE'
    }
}, {
    tableName: 'property_amenities',
    underscored: true,
    timestamps: false
});

export default PropertyAmenity;
