import { Subscription, User, PaymentRequest } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Subscription Controller
 * Manages user subscriptions and plan expiration
 */

// Get user's active subscription
export const getUserActiveSubscription = async (req, res, next) => {
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
        next(error);
    }
};

// Get user's subscription history
export const getUserSubscriptionHistory = async (req, res, next) => {
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
        next(error);
    }
};

// Check and expire old subscriptions (cron job / admin endpoint)
export const expireOldSubscriptions = async (req, res, next) => {
    try {
        const now = new Date();
        const { CreditBalance } = await import('../models/index.js');

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

        // --- Handle Unlimited Credit Expirations ---
        const expiredCreditBalances = await CreditBalance.findAll({
            where: {
                unlimitedUntil: { [Op.lt]: now }
            }
        });

        let expiredCreditsCount = 0;

        for (const balance of expiredCreditBalances) {
            await balance.update({
                availableCredits: 0,
                unlimitedUntil: null,
                updatedAt: now
            });
            expiredCreditsCount++;
        }

        res.json({
            message: `Expired ${expiredCount} subscriptions and ${expiredCreditsCount} unlimited credit plans`,
            count: expiredCount,
            creditsCount: expiredCreditsCount,
            expiredSubscriptions: expiredSubscriptions.map(s => ({
                id: s.id,
                userId: s.userId,
                planType: s.planType,
                expiresAt: s.expiresAt
            }))
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getUserActiveSubscription,
    getUserSubscriptionHistory,
    expireOldSubscriptions
};
