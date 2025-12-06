import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { PropertyType, StudentRequestStatus, getEnumValues } from '../utils/enums.js';

/**
 * StudentRequest Model
 * Student housing requests for bidirectional marketplace
 */
const StudentRequest = sequelize.define('StudentRequest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    studentId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'student_id',
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'SET NULL'
    },
    studentName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'student_name'
    },
    studentEmail: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'student_email'
    },
    studentPhone: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'student_phone'
    },
    studentWhatsapp: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'student_whatsapp'
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    universityTarget: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'university_target'
    },
    budgetMax: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'budget_max'
    },
    propertyTypeDesired: {
        type: DataTypes.ENUM(...getEnumValues(PropertyType)),
        allowNull: false,
        field: 'property_type_desired'
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
