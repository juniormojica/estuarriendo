import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { PropertyReportReason, PropertyReportStatus, getEnumValues } from '../utils/enums.js';

/**
 * PropertyReport Model
 * Reports from tenants about properties, e.g. already rented, to get credit refunds
 */
const PropertyReport = sequelize.define('PropertyReport', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    reporterId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'reporter_id',
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE'
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
    contactUnlockId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'contact_unlock_id',
        references: {
            model: 'contact_unlocks',
            key: 'id'
        },
        onDelete: 'CASCADE',
        comment: 'Associated unlock to refund if confirmed'
    },
    reason: {
        type: DataTypes.ENUM(...getEnumValues(PropertyReportReason)),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM(...getEnumValues(PropertyReportStatus)),
        allowNull: false,
        defaultValue: 'pending'
    },
    creditRefunded: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'credit_refunded'
    },
    adminNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'admin_notes'
    },
    processedBy: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'processed_by',
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'SET NULL'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    },
    processedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'processed_at'
    }
}, {
    tableName: 'property_reports',
    underscored: true,
    timestamps: false
});

export default PropertyReport;
