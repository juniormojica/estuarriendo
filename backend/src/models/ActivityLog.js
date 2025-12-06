import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * ActivityLog Model
 * System activity logging for admin dashboard and audit trail
 */
const ActivityLog = sequelize.define('ActivityLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Activity type (flexible string for various log types)'
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    userId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'SET NULL',
        comment: 'User who generated the activity (if applicable)'
    },
    propertyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'property_id',
        references: {
            model: 'properties',
            key: 'id'
        },
        onDelete: 'SET NULL',
        comment: 'Property affected (if applicable)'
    }
}, {
    tableName: 'activity_log',
    underscored: true,
    timestamps: false
});

export default ActivityLog;
