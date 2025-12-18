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
    amount: {
        type: DataTypes.DECIMAL(15, 0),
        allowNull: false
    },
    planType: {
        type: DataTypes.ENUM(...getEnumValues(SubscriptionType)),
        allowNull: true,
        field: 'plan_type'
    },
    planDuration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'plan_duration',
        comment: 'Duration in days'
    },
    referenceCode: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'reference_code'
    },
    proofImageUrl: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'proof_image_url',
        comment: 'Cloudinary URL of payment proof'
    },
    proofImagePublicId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'proof_image_public_id',
        comment: 'Cloudinary public_id for deletion'
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
