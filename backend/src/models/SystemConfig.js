import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * SystemConfig Model
 * Global system configuration (single row table)
 */
const SystemConfig = sequelize.define('SystemConfig', {
    id: {
        type: DataTypes.BOOLEAN,
        primaryKey: true,
        defaultValue: true,
        validate: {
            isTrue(value) {
                if (value !== true) {
                    throw new Error('Only one system config row is allowed');
                }
            }
        },
        comment: 'Ensures only one configuration row exists'
    },
    commissionRate: {
        type: DataTypes.DECIMAL(5, 4),
        allowNull: false,
        field: 'commission_rate',
        comment: 'Commission rate as decimal (e.g., 0.05 for 5%)'
    },
    featuredPropertyPrice: {
        type: DataTypes.DECIMAL(15, 0),
        allowNull: false,
        field: 'featured_property_price'
    },
    maxImagesPerProperty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'max_images_per_property'
    },
    minPropertyPrice: {
        type: DataTypes.DECIMAL(15, 0),
        allowNull: false,
        field: 'min_property_price'
    },
    maxPropertyPrice: {
        type: DataTypes.DECIMAL(15, 0),
        allowNull: false,
        field: 'max_property_price'
    },
    autoApprovalEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'auto_approval_enabled'
    }
}, {
    tableName: 'system_config',
    underscored: true,
    timestamps: false
});

export default SystemConfig;
