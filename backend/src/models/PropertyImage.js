import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * PropertyImage Model
 * Stores property images
 * 1:N relationship - one property has many images
 */
const PropertyImage = sequelize.define('PropertyImage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    propertyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'property_id',
        references: {
            model: 'properties',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    url: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Image URL (Cloudinary or other CDN)'
    },
    isFeatured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_featured',
        comment: 'Whether this is the main/featured image'
    },
    orderPosition: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'order_position',
        comment: 'Display order of the image'
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
    tableName: 'property_images',
    underscored: true,
    timestamps: false,
    indexes: [
        {
            fields: ['property_id', 'order_position']
        }
    ]
});

export default PropertyImage;
