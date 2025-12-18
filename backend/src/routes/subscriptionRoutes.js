import express from 'express';
import {
    getUserActiveSubscription,
    getUserSubscriptionHistory,
    expireOldSubscriptions
} from '../controllers/subscriptionController.js';

const router = express.Router();

// Get user's active subscription
router.get('/user/:userId/active', getUserActiveSubscription);

// Get user's subscription history
router.get('/user/:userId/history', getUserSubscriptionHistory);

// Expire old subscriptions (admin/cron)
router.post('/expire-old', expireOldSubscriptions);

export default router;
