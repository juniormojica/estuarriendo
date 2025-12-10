import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * Contact Model
 * Stores contact information for properties
 * 1:1 relationship - one property has one contact set
 */
const Contact = sequelize.define('Contact', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    propertyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: 'property_id',
        references: {
            model: 'properties',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    contactName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'contact_name'
    },
    contactPhone: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'contact_phone'
    },
    contactEmail: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'contact_email'
    },
    contactWhatsapp: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'contact_whatsapp'
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
    tableName: 'contacts',
    underscored: true,
    timestamps: false
});

export default Contact;
