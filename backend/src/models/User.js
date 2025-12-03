import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * Example User Model
 * This is a placeholder model demonstrating the structure
 */
const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'first_name' // Maps to first_name in DB
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'last_name' // Maps to last_name in DB
    },
    role: {
        type: DataTypes.ENUM('student', 'owner', 'admin'),
        defaultValue: 'student'
    }
}, {
    tableName: 'users',
    underscored: true
});

export default User;
