import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * CreditTransaction Model
 * Audit log of all credit movements (purchases, uses, refunds)
 */
const CreditTransaction = sequelize.define('CreditTransaction', {
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
        onDelete: 'CASCADE'
    },
    type: {
        type: DataTypes.ENUM('purchase', 'use', 'refund', 'expire'),
        allowNull: false
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Positive for purchase/refund, negative for use'
    },
    balanceAfter: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'balance_after',
        comment: 'Balance after this transaction was applied'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    referenceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'reference_id',
        comment: 'ID of related entity (ContactUnlock, PaymentRequest, etc)'
    },
    referenceType: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'reference_type',
        comment: 'contact_unlock, payment_request, property_report'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    }
}, {
    tableName: 'credit_transactions',
    underscored: true,
    timestamps: false
});

export default CreditTransaction;
