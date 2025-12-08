import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { SubscriptionType, PaymentRequestStatus, getEnumValues } from '../utils/enums.js';

/**
 * PaymentRequest Model
 * Manual payment proof submissions for premium plan upgrades
 */
const PaymentRequest = sequelize.define('PaymentRequest', {
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
    userName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'user_name'
    },
    amount: {
        type: DataTypes.DECIMAL(15, 0),
        allowNull: false
    },
    planType: {
        type: DataTypes.ENUM(...getEnumValues(SubscriptionType)),
        allowNull: false,
        field: 'plan_type'
    },
    planDuration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'plan_duration',
        comment: 'Duration in days'
    },
    referenceCode: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'reference_code'
    },
    proofImage: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'proof_image',
        comment: 'Base64 encoded payment proof image'
    },
    status: {
        type: DataTypes.ENUM(...getEnumValues(PaymentRequestStatus)),
        allowNull: false,
        defaultValue: PaymentRequestStatus.PENDING
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
    tableName: 'payment_requests',
    underscored: true,
    timestamps: false
});

export default PaymentRequest;
