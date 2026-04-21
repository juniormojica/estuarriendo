import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { DocumentVerificationStatus, getEnumValues } from '../utils/enums.js';

/**
 * UserVerificationDocuments Model
 * Stores verification documents (Cloudinary URLs) with individual verification statuses
 */
const UserVerificationDocuments = sequelize.define('UserVerificationDocuments', {
    userId: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    idFront: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'id_front',
        comment: 'URL encoded front of ID document'
    },
    idFrontStatus: {
        type: DataTypes.ENUM(...getEnumValues(DocumentVerificationStatus)),
        allowNull: false,
        defaultValue: DocumentVerificationStatus.NOT_SUBMITTED,
        field: 'id_front_status'
    },
    idFrontRejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'id_front_rejection_reason'
    },
    idBack: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'id_back',
        comment: 'URL encoded back of ID document'
    },
    idBackStatus: {
        type: DataTypes.ENUM(...getEnumValues(DocumentVerificationStatus)),
        allowNull: false,
        defaultValue: DocumentVerificationStatus.NOT_SUBMITTED,
        field: 'id_back_status'
    },
    idBackRejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'id_back_rejection_reason'
    },
    selfie: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'selfie',
        comment: 'URL encoded selfie photo'
    },
    selfieStatus: {
        type: DataTypes.ENUM(...getEnumValues(DocumentVerificationStatus)),
        allowNull: false,
        defaultValue: DocumentVerificationStatus.NOT_SUBMITTED,
        field: 'selfie_status'
    },
    selfieRejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'selfie_rejection_reason'
    },
    utilityBill: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'utility_bill',
        comment: 'Cloudinary URL of utility bill (only for owners)'
    },
    utilityBillStatus: {
        type: DataTypes.ENUM(...getEnumValues(DocumentVerificationStatus)),
        allowNull: false,
        defaultValue: DocumentVerificationStatus.NOT_SUBMITTED,
        field: 'utility_bill_status'
    },
    utilityBillRejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'utility_bill_rejection_reason'
    },
    submittedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'submitted_at'
    },
    processedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'processed_at'
    }
}, {
    tableName: 'user_verification_documents',
    underscored: true,
    timestamps: false
});

export default UserVerificationDocuments;
