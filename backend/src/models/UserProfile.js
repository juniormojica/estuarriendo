import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const UserProfile = sequelize.define('UserProfile', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    // Common Demographics
    birthDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'birth_date'
    },
    gender: {
        type: DataTypes.STRING, // 'male', 'female', 'other', 'prefer_not_to_say'
        allowNull: true
    },
    referralSource: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'referral_source'
    },
    lastActiveAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_active_at'
    },

    // Tenant Specific
    institutionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'institution_id',
        references: {
            model: 'institutions',
            key: 'id'
        }
    },
    academicProgram: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'academic_program'
    },
    currentSemester: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        field: 'current_semester'
    },
    originCityId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'origin_city_id',
        references: {
            model: 'cities',
            key: 'id'
        }
    },
    livingPreference: {
        type: DataTypes.STRING, // 'solo', 'shared', 'indifferent'
        allowNull: true,
        field: 'living_preference'
    },

    // Owner Specific
    totalPropertiesManaged: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        field: 'total_properties_managed'
    },
    yearsAsLandlord: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        field: 'years_as_landlord'
    },
    managesPersonally: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: 'manages_personally'
    }
}, {
    tableName: 'user_profiles',
    timestamps: true,
    underscored: true
});

export default UserProfile;
