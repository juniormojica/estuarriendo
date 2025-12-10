import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { VerificationStatus, getEnumValues } from '../utils/enums.js';

/**
 * UserVerification Model
 * Stores user verification status and process information
 * 1:1 relationship with User
 */
const UserVerification = sequelize.define('UserVerification', {
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
    isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_verified',
        comment: 'Whether user is verified'
    },
    verificationStatus: {
        type: DataTypes.ENUM(...getEnumValues(VerificationStatus)),
        allowNull: false,
        defaultValue: VerificationStatus.NOT_SUBMITTED,
        field: 'verification_status',
        comment: 'Current verification status'
    },
    verificationRejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'verification_rejection_reason',
        comment: 'Reason for verification rejection'
    },
    availableForVisit: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: 'available_for_visit',
        comment: 'For owner due diligence - available for property visits'
    },
    verifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'verified_at',
        comment: 'When user was verified'
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
    tableName: 'user_verification',
    underscored: true,
    timestamps: false
});

export default UserVerification;
