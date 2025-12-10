import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { PlanType, SubscriptionType, getEnumValues } from '../utils/enums.js';

/**
 * Subscription Model
 * Stores user subscription history and current plans
 * 1:N relationship with User (one user can have multiple subscriptions over time)
 */
const Subscription = sequelize.define('Subscription', {
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
    plan: {
        type: DataTypes.ENUM(...getEnumValues(PlanType)),
        allowNull: false,
        defaultValue: PlanType.FREE,
        comment: 'Subscription plan type'
    },
    planType: {
        type: DataTypes.ENUM(...getEnumValues(SubscriptionType)),
        allowNull: true,
        field: 'plan_type',
        comment: 'Billing cycle: weekly, monthly, quarterly (null for free plan)'
    },
    startedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'started_at',
        comment: 'When subscription started'
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'expires_at',
        comment: 'When subscription expires (null for free plan)'
    },
    paymentRequestId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'payment_request_id',
        references: {
            model: 'payment_requests',
            key: 'id'
        },
        comment: 'Associated payment request if paid'
    },
    status: {
        type: DataTypes.ENUM('active', 'expired', 'cancelled'),
        allowNull: false,
        defaultValue: 'active',
        comment: 'Current subscription status'
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
    tableName: 'subscriptions',
    underscored: true,
    timestamps: false,
    indexes: [
        {
            fields: ['user_id', 'status']
        },
        {
            fields: ['expires_at']
        }
    ]
});

export default Subscription;
