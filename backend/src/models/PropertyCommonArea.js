import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * PropertyCommonArea Model
 * Junction table linking properties (containers) with their common areas
 * Many-to-Many relationship between Property and CommonArea
 */
const PropertyCommonArea = sequelize.define('PropertyCommonArea', {
    propertyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        field: 'property_id',
        references: {
            model: 'properties',
            key: 'id'
        },
        onDelete: 'CASCADE',
        comment: 'Reference to the property (container)'
    },
    commonAreaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        field: 'common_area_id',
        references: {
            model: 'common_areas',
            key: 'id'
        },
        onDelete: 'CASCADE',
        comment: 'Reference to the common area'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    }
}, {
    tableName: 'property_common_areas',
    underscored: true,
    timestamps: false
});

export default PropertyCommonArea;
