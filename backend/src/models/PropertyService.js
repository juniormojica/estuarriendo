import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * PropertyService Model
 * Represents services included with a property (mainly for pension type)
 * Examples: breakfast, lunch, dinner, housekeeping, laundry
 */
const PropertyService = sequelize.define('PropertyService', {
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
        onDelete: 'CASCADE',
        comment: 'Foreign key to properties table'
    },
    serviceType: {
        type: DataTypes.ENUM(
            'breakfast',      // Desayuno
            'lunch',          // Almuerzo
            'dinner',         // Cena
            'housekeeping',   // Aseo a la habitación
            'laundry',        // Lavandería
            'wifi',           // WiFi (if not in amenities)
            'utilities'       // Servicios públicos incluidos
        ),
        allowNull: false,
        field: 'service_type',
        comment: 'Type of service provided'
    },
    isIncluded: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_included',
        comment: 'Whether the service is included in the base price'
    },
    additionalCost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'additional_cost',
        comment: 'Extra cost if service is optional (in COP)'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Additional details about the service'
    }
}, {
    tableName: 'property_services',
    underscored: true,
    timestamps: false
});

export default PropertyService;
