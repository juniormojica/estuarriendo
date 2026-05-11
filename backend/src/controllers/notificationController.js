import { Notification, User, Property } from '../models/index.js';
import { NotificationType } from '../utils/enums.js';
import { badRequest, notFound } from '../errors/AppError.js';

/**
 * Notification Controller
 * Handles user notifications
 */

// Get all notifications for a user
export const getUserNotifications = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { read, limit = 50, offset = 0 } = req.query;

        const where = { userId };
        if (read !== undefined) {
            where.read = read === 'true';
        }

        const notifications = await Notification.findAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json(notifications);
    } catch (error) {
        next(error);
    }
};

// Get unread notification count
export const getUnreadCount = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const count = await Notification.count({
            where: {
                userId,
                read: false
            }
        });

        res.json({ count });
    } catch (error) {
        next(error);
    }
};

// Create notification
export const createNotification = async (req, res, next) => {
    try {
        const { userId, type, title, message, propertyId, propertyTitle, interestedUserId } = req.body;

        // Validate required fields
        if (!userId || !type || !title || !message) {
            throw badRequest('userId, type, title, and message are required', {
                code: 'NOTIFICATION_REQUIRED_FIELDS_MISSING'
            });
        }

        // Verify user exists
        const user = await User.findByPk(userId);
        if (!user) {
            throw notFound('User not found', { code: 'NOTIFICATION_USER_NOT_FOUND' });
        }

        const notification = await Notification.create({
            userId,
            type,
            title,
            message,
            propertyId,
            propertyTitle,
            interestedUserId,
            read: false,
            createdAt: new Date()
        });

        res.status(201).json(notification);
    } catch (error) {
        next(error);
    }
};

// Mark notification as read
export const markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findByPk(id);
        if (!notification) {
            throw notFound('Notification not found', { code: 'NOTIFICATION_NOT_FOUND' });
        }

        await notification.update({ read: true });
        res.json(notification);
    } catch (error) {
        next(error);
    }
};

// Mark all notifications as read for a user
export const markAllAsRead = async (req, res, next) => {
    try {
        const { userId } = req.params;

        await Notification.update(
            { read: true },
            { where: { userId, read: false } }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        next(error);
    }
};

// Delete notification
export const deleteNotification = async (req, res, next) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findByPk(id);
        if (!notification) {
            throw notFound('Notification not found', { code: 'NOTIFICATION_NOT_FOUND' });
        }

        await notification.destroy();
        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// Delete all read notifications for a user
export const deleteAllRead = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const deletedCount = await Notification.destroy({
            where: {
                userId,
                read: true
            }
        });

        res.json({
            message: 'Read notifications deleted successfully',
            deletedCount
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getUserNotifications,
    getUnreadCount,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead
};
