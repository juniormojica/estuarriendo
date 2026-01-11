import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * PropertyRule Model
 * Represents rules and restrictions for a property (mainly for habitacion and pension types)
 * Examples: allows visits, allows pets, smoking policy, curfew time, tenant profile
 */
const PropertyRule = sequelize.define('PropertyRule', {
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
    ruleType: {
        type: DataTypes.ENUM(
            'visits',         // Permite visitas
            'pets',           // Permite mascotas
            'smoking',        // Permite fumar
            'noise',          // Horario de silencio
            'curfew',         // Hora límite de llegada
            'tenant_profile', // Perfil de inquilino (solo mujeres/hombres/mixto)
            'couples',        // Permite parejas
            'children'        // Permite niños
        ),
        allowNull: false,
        field: 'rule_type',
        comment: 'Type of rule or restriction'
    },
    isAllowed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'is_allowed',
        comment: 'Whether this rule allows or restricts the activity'
    },
    value: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'For rules that need a value (e.g., curfew time: "22:00", tenant_profile: "solo_mujeres")'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Additional details about the rule'
    }
}, {
    tableName: 'property_rules',
    underscored: true,
    timestamps: false
});

export default PropertyRule;
