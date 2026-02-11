import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * CommonArea Model
 * Represents common/shared areas in property containers
 * Examples: shared kitchen, living room, laundry, parking, etc.
 */
const CommonArea = sequelize.define('CommonArea', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Display name of the common area (e.g., "Cocina compartida")'
    },
    icon: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Emoji or icon identifier for UI display (e.g., "🍳")'
    },
    slug: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
        comment: 'URL-friendly identifier (e.g., "cocina-compartida")'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Detailed description of the common area'
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
    tableName: 'common_areas',
    underscored: true,
    timestamps: false
});

export default CommonArea;
