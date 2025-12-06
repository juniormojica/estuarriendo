import { Notification, User, Property } from '../models/index.js';
import { NotificationType } from '../utils/enums.js';

/**
 * Notification Controller
 * Handles user notifications
 */

// Get all notifications for a user
export const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const { read, limit = 50, offset = 0 } = req.query;

        const where = { userId };
        if (read !== undefined) {
            where.read = read === 'true';
        }

        const notifications = await Notification.findAll({
            where,
            include: [
                {
                    model: Property,
                    as: 'property',
                    attributes: ['id', 'title', 'type'],
                    required: false
                },
                {
                    model: User,
                    as: 'interestedUser',
                    attributes: ['id', 'name', 'email', 'phone', 'whatsapp'],
                    required: false
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications', message: error.message });
    }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
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
        console.error('Error fetching unread count:', error);
        res.status(500).json({ error: 'Failed to fetch unread count', message: error.message });
    }
};

// Create notification
export const createNotification = async (req, res) => {
    try {
        const { userId, type, title, message, propertyId, propertyTitle, interestedUserId } = req.body;

        // Validate required fields
        if (!userId || !type || !title || !message) {
            return res.status(400).json({ error: 'userId, type, title, and message are required' });
        }

        // Verify user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
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
        console.error('Error creating notification:', error);
        res.status(500).json({ error: 'Failed to create notification', message: error.message });
    }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findByPk(id);
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        await notification.update({ read: true });
        res.json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read', message: error.message });
    }
};

// Mark all notifications as read for a user
export const markAllAsRead = async (req, res) => {
    try {
        const { userId } = req.params;

        await Notification.update(
            { read: true },
            { where: { userId, read: false } }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ error: 'Failed to mark all notifications as read', message: error.message });
    }
};

// Delete notification
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findByPk(id);
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        await notification.destroy();
        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: 'Failed to delete notification', message: error.message });
    }
};

// Delete all read notifications for a user
export const deleteAllRead = async (req, res) => {
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
        console.error('Error deleting read notifications:', error);
        res.status(500).json({ error: 'Failed to delete read notifications', message: error.message });
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
