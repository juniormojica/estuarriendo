import { ActivityLog, User, Property, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * ActivityLog Controller
 * Handles system activity logging and retrieval
 */

// Get all activity logs with filters
export const getAllActivityLogs = async (req, res) => {
    try {
        const {
            type,
            userId,
            propertyId,
            startDate,
            endDate,
            limit = 100,
            offset = 0
        } = req.query;

        const where = {};

        if (type) where.type = type;
        if (userId) where.userId = userId;
        if (propertyId) where.propertyId = propertyId;

        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate) where.timestamp[Op.gte] = new Date(startDate);
            if (endDate) where.timestamp[Op.lte] = new Date(endDate);
        }

        const logs = await ActivityLog.findAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email'],
                    required: false
                },
                {
                    model: Property,
                    as: 'property',
                    attributes: ['id', 'title', 'type'],
                    required: false
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['timestamp', 'DESC']]
        });

        res.json(logs);
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        res.status(500).json({ error: 'Failed to fetch activity logs', message: error.message });
    }
};

// Get activity log by ID
export const getActivityLogById = async (req, res) => {
    try {
        const { id } = req.params;

        const log = await ActivityLog.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email'],
                    required: false
                },
                {
                    model: Property,
                    as: 'property',
                    attributes: ['id', 'title', 'type'],
                    required: false
                }
            ]
        });

        if (!log) {
            return res.status(404).json({ error: 'Activity log not found' });
        }

        res.json(log);
    } catch (error) {
        console.error('Error fetching activity log:', error);
        res.status(500).json({ error: 'Failed to fetch activity log', message: error.message });
    }
};

// Create activity log
export const createActivityLog = async (req, res) => {
    try {
        const { type, message, userId, propertyId } = req.body;

        // Validate required fields
        if (!type || !message) {
            return res.status(400).json({ error: 'type and message are required' });
        }

        const log = await ActivityLog.create({
            type,
            message,
            userId,
            propertyId,
            timestamp: new Date()
        });

        res.status(201).json(log);
    } catch (error) {
        console.error('Error creating activity log:', error);
        res.status(500).json({ error: 'Failed to create activity log', message: error.message });
    }
};

// Get activity statistics
export const getActivityStatistics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const where = {};
        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate) where.timestamp[Op.gte] = new Date(startDate);
            if (endDate) where.timestamp[Op.lte] = new Date(endDate);
        }

        const totalLogs = await ActivityLog.count({ where });

        // Get activity by type
        const activityByType = await ActivityLog.findAll({
            where,
            attributes: [
                'type',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['type'],
            raw: true
        });

        // Get recent activity (last 24 hours)
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const recentActivity = await ActivityLog.count({
            where: {
                timestamp: { [Op.gte]: oneDayAgo }
            }
        });

        res.json({
            totalLogs,
            activityByType,
            recentActivity
        });
    } catch (error) {
        console.error('Error fetching activity statistics:', error);
        res.status(500).json({ error: 'Failed to fetch activity statistics', message: error.message });
    }
};

// Delete old activity logs (cleanup)
export const deleteOldLogs = async (req, res) => {
    try {
        const { daysOld = 90 } = req.body;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(daysOld));

        const deletedCount = await ActivityLog.destroy({
            where: {
                timestamp: { [Op.lt]: cutoffDate }
            }
        });

        res.json({
            message: `Deleted activity logs older than ${daysOld} days`,
            deletedCount
        });
    } catch (error) {
        console.error('Error deleting old logs:', error);
        res.status(500).json({ error: 'Failed to delete old logs', message: error.message });
    }
};

export default {
    getAllActivityLogs,
    getActivityLogById,
    createActivityLog,
    getActivityStatistics,
    deleteOldLogs
};
