import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { UserType, getEnumValues } from '../utils/enums.js';

/**
 * User Model (Normalized)
 * Core authentication and profile information only
 * Related data moved to specialized tables
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
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Hashed password for authentication'
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
        field: 'user_type',
        comment: 'User role: owner, tenant, admin, super_admin'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
        comment: 'Whether user account is active'
    },
    plan: {
        type: DataTypes.ENUM('free', 'premium'),
        allowNull: false,
        defaultValue: 'free',
        comment: 'Current user plan (denormalized from subscriptions)'
    },
    verificationStatus: {
        type: DataTypes.ENUM('not_submitted', 'pending', 'verified', 'rejected'),
        allowNull: false,
        defaultValue: 'not_submitted',
        field: 'verification_status',
        comment: 'User verification status'
    },
    joinedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'joined_at',
        comment: 'When user joined the platform'
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'updated_at',
        comment: 'Last update timestamp'
    }
}, {
    tableName: 'users',
    underscored: true,
    timestamps: false, // Managing timestamps manually
    defaultScope: {
        attributes: { exclude: ['password'] }
    },
    scopes: {
        withPassword: {
            attributes: { include: ['password'] }
        }
    }
});

export default User;
