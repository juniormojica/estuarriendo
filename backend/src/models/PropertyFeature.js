import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * PropertyFeature Model
 * Stores property features and amenities
 * 1:1 relationship - one property has one feature set
 */
const PropertyFeature = sequelize.define('PropertyFeature', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    propertyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: 'property_id',
        references: {
            model: 'properties',
            key: 'id'
        },
        onDelete: 'CASCADE'
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
    allowsPets: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'allows_pets'
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
    tableName: 'property_features',
    underscored: true,
    timestamps: false
});

export default PropertyFeature;
