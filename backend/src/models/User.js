import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import {
    IdType,
    OwnerRole,
    UserType,
    PaymentMethod,
    VerificationStatus,
    PlanType,
    SubscriptionType,
    getEnumValues
} from '../utils/enums.js';

/**
 * User Model
 * Represents all user types: owner, tenant, admin, superAdmin
 */
const User = sequelize.define('User', {
    id: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false,
        comment: 'UID from authentication system'
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    whatsapp: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    userType: {
        type: DataTypes.ENUM(...getEnumValues(UserType)),
        allowNull: false,
        field: 'user_type'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active'
    },
    joinedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'joined_at'
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'updated_at'
    },

    // Identification Details
    idType: {
        type: DataTypes.ENUM(...getEnumValues(IdType)),
        allowNull: true,
        field: 'id_type'
    },
    idNumber: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'id_number'
    },
    ownerRole: {
        type: DataTypes.ENUM(...getEnumValues(OwnerRole)),
        allowNull: true,
        field: 'owner_role',
        comment: 'Only applicable for owner user type'
    },

    // Verification
    isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_verified'
    },
    verificationStatus: {
        type: DataTypes.ENUM(...getEnumValues(VerificationStatus)),
        allowNull: false,
        defaultValue: VerificationStatus.NOT_SUBMITTED,
        field: 'verification_status'
    },
    verificationRejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'verification_rejection_reason'
    },

    // Payment/Billing Details
    paymentPreference: {
        type: DataTypes.ENUM(...getEnumValues(PaymentMethod)),
        allowNull: true,
        field: 'payment_preference'
    },
    bankDetails: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'bank_details',
        comment: 'Stores BankDetails interface: { bankName, accountNumber, accountType, accountHolderName }'
    },
    billingDetails: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'billing_details',
        comment: 'Stores BillingDetails interface: { legalName, idType, idNumber, address, city, phone }'
    },
    availableForVisit: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: 'available_for_visit'
    },

    // Denormalized Statistics
    propertiesCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'properties_count'
    },
    approvedCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'approved_count'
    },
    pendingCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'pending_count'
    },
    rejectedCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'rejected_count'
    },

    // Plans/Subscription
    plan: {
        type: DataTypes.ENUM(...getEnumValues(PlanType)),
        allowNull: true,
        defaultValue: PlanType.FREE,
        field: 'plan'
    },
    planType: {
        type: DataTypes.ENUM(...getEnumValues(SubscriptionType)),
        allowNull: true,
        field: 'plan_type'
    },
    planStartedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'plan_started_at'
    },
    planExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'plan_expires_at'
    },
    paymentRequestId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'payment_request_id',
        comment: 'FK to payment_requests if paid with proof'
    },
    premiumSince: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'premium_since'
    }
}, {
    tableName: 'users',
    underscored: true,
    timestamps: false // We're managing timestamps manually
});

export default User;
