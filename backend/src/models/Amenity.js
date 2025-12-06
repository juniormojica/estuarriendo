import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * Amenity Model
 * Master table for property amenities/features
 */
const Amenity = sequelize.define('Amenity', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    icon: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Icon identifier or URL for the amenity'
    }
}, {
    tableName: 'amenities',
    underscored: true,
    timestamps: false
});

export default Amenity;
