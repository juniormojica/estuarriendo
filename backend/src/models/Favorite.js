import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * Favorite Model
 * Many-to-Many relationship between Users and Properties
 * Tracks which properties users have favorited
 */
const Favorite = sequelize.define('Favorite', {
    userId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        primaryKey: true,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'User who favorited the property'
    },
    propertyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        field: 'property_id',
        references: {
            model: 'properties',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'Property that was favorited'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
        comment: 'When the favorite was added'
    }
}, {
    tableName: 'favorites',
    underscored: true,
    timestamps: false, // Managing timestamps manually
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'property_id']
        },
        {
            fields: ['user_id']
        },
        {
            fields: ['property_id']
        }
    ]
});

export default Favorite;
