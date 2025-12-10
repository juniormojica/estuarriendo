import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * PropertyInstitution Model
 * Junction table for N:M relationship between properties and institutions
 * Stores which institutions are near which properties
 */
const PropertyInstitution = sequelize.define('PropertyInstitution', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    propertyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'property_id',
        references: {
            model: 'properties',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    institutionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'institution_id',
        references: {
            model: 'institutions',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    distance: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Distance in meters (optional)'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    }
}, {
    tableName: 'property_institutions',
    underscored: true,
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['property_id', 'institution_id']
        }
    ]
});

export default PropertyInstitution;
