import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { PaymentMethod, getEnumValues } from '../utils/enums.js';

/**
 * UserBillingDetails Model
 * Stores financial and payment information
 * 1:1 relationship with User
 */
const UserBillingDetails = sequelize.define('UserBillingDetails', {
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
    paymentPreference: {
        type: DataTypes.ENUM(...getEnumValues(PaymentMethod)),
        allowNull: true,
        field: 'payment_preference',
        comment: 'Preferred payment method'
    },
    bankDetails: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'bank_details',
        comment: 'Bank account details: { bankName, accountNumber, accountType, accountHolderName }'
    },
    billingDetails: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'billing_details',
        comment: 'Billing information: { legalName, idType, idNumber, address, city, phone }'
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
    tableName: 'user_billing_details',
    underscored: true,
    timestamps: false
});

export default UserBillingDetails;
