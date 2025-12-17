import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { StudentRequestStatus, getEnumValues } from '../utils/enums.js';

/**
 * StudentRequest Model (Normalized)
 * Student housing requests for bidirectional marketplace
 * Contact information fetched from User table via JOIN
 */
const StudentRequest = sequelize.define('StudentRequest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    studentId: {
        type: DataTypes.STRING(255),
        allowNull: false,  // Changed from true - student must be a registered user
        field: 'student_id',
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE'  // Changed from SET NULL - delete request if user deleted
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
        comment: 'City where student is looking for property'
    },
    institutionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'institution_id',
        references: {
            model: 'institutions',
            key: 'id'
        },
        onDelete: 'SET NULL',
        comment: 'Target institution (university/corporation) - optional'
    },
    universityTarget: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'university_target',
        comment: 'Free-text university name if not in our database'
    },
    budgetMax: {
        type: DataTypes.DECIMAL(15, 0),
        allowNull: false,
        field: 'budget_max'
    },
    propertyTypeDesired: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'property_type_desired',
        comment: 'Desired property type: pension, habitacion, apartamento, aparta-estudio'
    },
    requiredAmenities: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: true,
        field: 'required_amenities'
    },
    dealBreakers: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: true,
        field: 'deal_breakers'
    },
    moveInDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'move_in_date'
    },
    contractDuration: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        field: 'contract_duration',
        comment: 'Duration in months'
    },
    additionalNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'additional_notes'
    },
    status: {
        type: DataTypes.ENUM(...getEnumValues(StudentRequestStatus)),
        allowNull: false,
        defaultValue: StudentRequestStatus.OPEN
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at'
    }
}, {
    tableName: 'student_requests',
    underscored: true,
    timestamps: false
});

export default StudentRequest;
