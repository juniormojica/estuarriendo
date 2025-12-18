import { Subscription, User, PaymentRequest } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Subscription Controller
 * Manages user subscriptions and plan expiration
 */

// Get user's active subscription
export const getUserActiveSubscription = async (req, res) => {
    try {
        const { userId } = req.params;

        const subscription = await Subscription.findOne({
            where: {
                userId,
                status: 'active',
                expiresAt: { [Op.gt]: new Date() }
            },
            include: [{
                model: PaymentRequest,
                as: 'paymentRequest',
                attributes: ['id', 'amount', 'referenceCode', 'createdAt']
            }],
            order: [['createdAt', 'DESC']]
        });

        if (!subscription) {
            return res.json({ subscription: null, message: 'No active subscription' });
        }

        res.json(subscription);
    } catch (error) {
        console.error('Error fetching active subscription:', error);
        res.status(500).json({ error: 'Failed to fetch subscription', message: error.message });
    }
};

// Get user's subscription history
export const getUserSubscriptionHistory = async (req, res) => {
    try {
        const { userId } = req.params;

        const subscriptions = await Subscription.findAll({
            where: { userId },
            include: [{
                model: PaymentRequest,
                as: 'paymentRequest',
                attributes: ['id', 'amount', 'referenceCode', 'createdAt']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json(subscriptions);
    } catch (error) {
        console.error('Error fetching subscription history:', error);
        res.status(500).json({ error: 'Failed to fetch subscription history', message: error.message });
    }
};

// Check and expire old subscriptions (cron job / admin endpoint)
export const expireOldSubscriptions = async (req, res) => {
    try {
        const now = new Date();

        // Find all active subscriptions that have expired
        const expiredSubscriptions = await Subscription.findAll({
            where: {
                status: 'active',
                expiresAt: { [Op.lt]: now }
            },
            include: [{
                model: User,
                as: 'user'
            }]
        });

        let expiredCount = 0;

        for (const subscription of expiredSubscriptions) {
            // Update subscription status
            await subscription.update({
                status: 'expired',
                updatedAt: now
            });

            // Downgrade user to free plan
            if (subscription.user) {
                await subscription.user.update({
                    plan: 'free',
                    updatedAt: now
                });
            }

            expiredCount++;
        }

        res.json({
            message: `Expired ${expiredCount} subscriptions`,
            count: expiredCount,
            expiredSubscriptions: expiredSubscriptions.map(s => ({
                id: s.id,
                userId: s.userId,
                planType: s.planType,
                expiresAt: s.expiresAt
            }))
        });
    } catch (error) {
        console.error('Error expiring subscriptions:', error);
        res.status(500).json({ error: 'Failed to expire subscriptions', message: error.message });
    }
};

export default {
    getUserActiveSubscription,
    getUserSubscriptionHistory,
    expireOldSubscriptions
};
