import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * City Model
 * Stores Colombian cities
 * Used for location normalization and autocomplete
 */
const City = sequelize.define('City', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'City name (e.g., "Bogotá", "Medellín")'
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
        comment: 'Department this city belongs to'
    },
    slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'URL-friendly slug (e.g., "bogota", "medellin")'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
        comment: 'Whether this city is active for selection'
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
         defaultValue: DataTypes.NOW,
        field: 'updated_at'
    }
}, {
    tableName: 'cities',
    underscored: true,
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['slug', 'department_id']
        },
        {
            fields: ['department_id']
        },
        {
            fields: ['is_active']
        },
        {
            fields: ['name']
        }
    ]
});

export default City;
