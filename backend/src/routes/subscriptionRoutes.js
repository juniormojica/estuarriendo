import express from 'express';
import {
    getUserActiveSubscription,
    getUserSubscriptionHistory,
    expireOldSubscriptions
} from '../controllers/subscriptionController.js';
import authMiddleware from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';

const router = express.Router();

// User-facing subscription routes
router.get('/user/:userId/active', getUserActiveSubscription);
router.get('/user/:userId/history', getUserSubscriptionHistory);

// Admin: expire old subscriptions
router.post('/expire-old', authMiddleware, requireAdmin, expireOldSubscriptions);

export default router;
