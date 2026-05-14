import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';
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

// Get user notifications (own only — enforced in controller)
router.get('/user/:userId', authMiddleware, getUserNotifications);

// Get unread count (own only)
router.get('/user/:userId/unread-count', authMiddleware, getUnreadCount);

// Create notification (admin only — app uses notificationService internally)
router.post('/', authMiddleware, requireAdmin, createNotification);

// Mark notification as read (own only)
router.put('/:id/read', authMiddleware, markAsRead);

// Mark all notifications as read for a user (own only)
router.put('/user/:userId/read-all', authMiddleware, markAllAsRead);

// Delete notification (own only)
router.delete('/:id', authMiddleware, deleteNotification);

// Delete all read notifications for a user (own only)
router.delete('/user/:userId/read', authMiddleware, deleteAllRead);

export default router;
