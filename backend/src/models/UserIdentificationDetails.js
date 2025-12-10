import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { IdType, OwnerRole, getEnumValues } from '../utils/enums.js';

/**
 * UserIdentificationDetails Model
 * Stores legal identification information
 * 1:1 relationship with User
 */
const UserIdentificationDetails = sequelize.define('UserIdentificationDetails', {
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
    idType: {
        type: DataTypes.ENUM(...getEnumValues(IdType)),
        allowNull: true,
        field: 'id_type',
        comment: 'Type of identification document'
    },
    idNumber: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'id_number',
        comment: 'Identification number'
    },
    ownerRole: {
        type: DataTypes.ENUM(...getEnumValues(OwnerRole)),
        allowNull: true,
        field: 'owner_role',
        comment: 'Only applicable for owner user type: individual or agency'
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
    tableName: 'user_identification_details',
    underscored: true,
    timestamps: false
});

export default UserIdentificationDetails;
