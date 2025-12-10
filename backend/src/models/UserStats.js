import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * UserStats Model
 * Stores denormalized user statistics for performance
 * 1:1 relationship with User
 */
const UserStats = sequelize.define('UserStats', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    propertiesCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'properties_count',
        comment: 'Total number of properties owned'
    },
    approvedCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'approved_count',
        comment: 'Number of approved properties'
    },
    pendingCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'pending_count',
        comment: 'Number of pending properties'
    },
    rejectedCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'rejected_count',
        comment: 'Number of rejected properties'
    },
    lastUpdatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_updated_at',
        comment: 'When stats were last updated'
    }
}, {
    tableName: 'user_stats',
    underscored: true,
    timestamps: false
});

export default UserStats;
