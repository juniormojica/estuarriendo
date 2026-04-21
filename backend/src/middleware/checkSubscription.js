import { Subscription, User } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Lazy Subscription Check Middleware
 * Runs after authMiddleware.
 * Checks if the user's active subscription has expired.
 * If so, instantly downgrades them to 'free' before resolving the request.
 */
export const checkSubscription = async (req, res, next) => {
    try {
        // If not authenticated (shouldn't happen if placed after authMiddleware), skip
        if (!req.userId) return next();

        const now = new Date();

        // Check if there's any active subscription that should have expired
        const expiredSubscription = await Subscription.findOne({
            where: {
                userId: req.userId,
                status: 'active',
                expiresAt: { [Op.lt]: now }
            }
        });

        if (expiredSubscription) {
            console.log(`[LazyCheck] Found expired subscription for user ${req.userId}. Downgrading to free.`);

            // Mark subscription as expired
            await expiredSubscription.update({
                status: 'expired',
                updatedAt: now
            });

            // Downgrade user's plan to free
            await User.update(
                { plan: 'free', updatedAt: now },
                { where: { id: req.userId } }
            );
        }

        // We only check normal subscriptions here. Credits (unlimited deals) could be added similarly, 
        // but they are checked/managed upon spending rather than per request generally.

        next();
    } catch (error) {
        // Never block the request if this non-critical check fails
        console.error('[LazyCheck] Error checking subscription:', error);
        next();
    }
};

export default checkSubscription;
