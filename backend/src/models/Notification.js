import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { NotificationType, getEnumValues } from '../utils/enums.js';

/**
 * Notification Model
 * User notifications for property interest, payments, approvals, etc.
 */
const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE',
        comment: 'Recipient of the notification'
    },
    type: {
        type: DataTypes.ENUM(...getEnumValues(NotificationType)),
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    propertyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'property_id',
        references: {
            model: 'properties',
            key: 'id'
        },
        onDelete: 'SET NULL'
    },
    propertyTitle: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'property_title'
    },
    interestedUserId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'interested_user_id',
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'SET NULL',
        comment: 'User who generated the notification (e.g., interested tenant)'
    },
    read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    }
}, {
    tableName: 'notifications',
    underscored: true,
    timestamps: false
});

export default Notification;
