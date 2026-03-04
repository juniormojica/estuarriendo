import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { ReportActivityAction } from '../utils/enums.js';

const ReportActivityLog = sequelize.define('ReportActivityLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    reportId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'report_id',
        references: {
            model: 'property_reports',
            key: 'id'
        }
    },
    adminId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'admin_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    action: {
        type: DataTypes.ENUM(...Object.values(ReportActivityAction)),
        allowNull: false
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'report_activity_logs',
    timestamps: true,
    updatedAt: false // Only createdAt is needed for logs
});

export default ReportActivityLog;
