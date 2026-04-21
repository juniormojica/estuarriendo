import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * ContactUnlock Model
 * Represents a contact unlock by a tenant for a specific property
 */
const ContactUnlock = sequelize.define('ContactUnlock', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tenantId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'tenant_id',
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
    ownerId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'owner_id',
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    creditTransactionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'credit_transaction_id',
        references: {
            model: 'credit_transactions',
            key: 'id'
        },
        onDelete: 'SET NULL',
        comment: 'Transaction where the credit was deducted (null if unlocked via unlimited plan)'
    },
    status: {
        type: DataTypes.ENUM('active', 'refunded'),
        allowNull: false,
        defaultValue: 'active'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    }
}, {
    tableName: 'contact_unlocks',
    underscored: true,
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['tenant_id', 'property_id'],
            name: 'unique_tenant_property_unlock'
        }
    ]
});

export default ContactUnlock;
