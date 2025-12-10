import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * UserPasswordReset Model
 * Stores temporary password reset tokens
 * 1:1 relationship with User
 */
const UserPasswordReset = sequelize.define('UserPasswordReset', {
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
    resetPasswordToken: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'reset_password_token',
        comment: 'Hashed token for password reset'
    },
    resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'reset_password_expires',
        comment: 'Expiration time for reset token'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    }
}, {
    tableName: 'user_password_reset',
    underscored: true,
    timestamps: false
});

export default UserPasswordReset;
