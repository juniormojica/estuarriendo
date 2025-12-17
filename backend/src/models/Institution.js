import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * Institution Model
 * Stores educational and corporate institutions (universities, corporations, institutes)
 * N:M relationship with properties through PropertyInstitution
 */
const Institution = sequelize.define('Institution', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Institution name'
    },
    cityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'city_id',
        references: {
            model: 'cities',
            key: 'id'
        },
        onDelete: 'RESTRICT',
        comment: 'City where institution is located'
    },
    type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Type: universidad, corporacion, instituto, etc.'
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
    tableName: 'institutions',
    underscored: true,
    timestamps: false,
    indexes: [
        {
            fields: ['city_id', 'type']
        },
        {
            unique: true,
            fields: ['name', 'city_id']
        }
    ]
});

export default Institution;
