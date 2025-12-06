import express from 'express';
import {
    getUserNotifications,
    getUnreadCount,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead
} from '../controllers/notificationController.js';

const router = express.Router();

// Get user notifications
router.get('/user/:userId', getUserNotifications);

// Get unread count
router.get('/user/:userId/unread-count', getUnreadCount);

// Create notification
router.post('/', createNotification);

// Mark notification as read
router.put('/:id/read', markAsRead);

// Mark all notifications as read for a user
router.put('/user/:userId/read-all', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

// Delete all read notifications for a user
router.delete('/user/:userId/read', deleteAllRead);

export default router;
