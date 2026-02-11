import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * UserVerificationDocuments Model
 * Stores verification documents (base64 encoded) for user identity verification
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
        allowNull: false,
        field: 'id_front',
        comment: 'Base64 encoded front of ID document'
    },
    idBack: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'id_back',
        comment: 'Base64 encoded back of ID document'
    },
    selfie: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'selfie',
        comment: 'Base64 encoded selfie photo'
    },
    utilityBill: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'utility_bill',
        comment: 'Cloudinary URL of utility bill (only for owners)'
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
