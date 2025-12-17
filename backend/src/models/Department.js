import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * Department Model
 * Stores Colombian departments (32 total)
 * Used for location normalization
 */
const Department = sequelize.define('Department', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Department name (e.g., "Cundinamarca", "Antioquia")'
    },
    code: {
        type: DataTypes.STRING(3),
        allowNull: false,
        unique: true,
        comment: 'ISO department code (e.g., "CUN", "ANT")'
    },
    slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'URL-friendly slug (e.g., "cundinamarca", "antioquia")'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
        comment: 'Whether this department is active for selection'
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
    tableName: 'departments',
    underscored: true,
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['code']
        },
        {
            unique: true,
            fields: ['slug']
        },
        {
            fields: ['is_active']
        }
    ]
});

export default Department;
