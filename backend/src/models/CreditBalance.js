import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * CreditBalance Model
 * Stores the current credit balance for tenant users
 */
const CreditBalance = sequelize.define('CreditBalance', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    availableCredits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'available_credits',
        comment: 'Available credits. -1 means unlimited'
    },
    totalPurchased: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'total_purchased'
    },
    totalUsed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'total_used'
    },
    totalRefunded: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'total_refunded'
    },
    unlimitedUntil: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'unlimited_until',
        comment: 'If the user has unlimited plan, when does it expire'
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
    tableName: 'credit_balances',
    underscored: true,
    timestamps: false
});

export default CreditBalance;
