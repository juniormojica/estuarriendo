import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * PropertyType Model
 * Reference table for property types
 * Replaces ENUM with reusable reference table
 */
const PropertyType = sequelize.define('PropertyType', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Type name: pension, habitacion, apartamento, aparta-estudio'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description of the property type'
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
    tableName: 'property_types',
    underscored: true,
    timestamps: false
});

export default PropertyType;
