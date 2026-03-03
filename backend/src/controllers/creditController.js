import { User, Property, CreditBalance, CreditTransaction, ContactUnlock, Notification } from '../models/index.js';
import { CreditTransactionType, ContactUnlockStatus, UserType } from '../utils/enums.js';
import notificationService from '../services/notificationService.js';
import { sequelize } from '../config/database.js';

/**
 * Get user's credit balance
 */
export const getCreditBalance = async (req, res) => {
    try {
        const { userId } = req.params;

        const balance = await CreditBalance.findOne({ where: { userId } });

        if (!balance) {
            // Return default if not exists
            return res.json({
                availableCredits: 0,
                unlimitedUntil: null
            });
        }

        res.json(balance);
    } catch (error) {
        console.error('Error fetching credit balance:', error);
        res.status(500).json({ error: 'Failed to fetch credit balance', message: error.message });
    }
};

/**
 * Get user's credit transactions
 */
export const getCreditTransactions = async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 20, offset = 0 } = req.query;

        const transactions = await CreditTransaction.findAll({
            where: { userId },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json(transactions);
    } catch (error) {
        console.error('Error fetching credit transactions:', error);
        res.status(500).json({ error: 'Failed to fetch credit transactions', message: error.message });
    }
};

/**
 * Check if a user has already unlocked a property
 */
export const checkContactUnlocked = async (req, res) => {
    try {
        const { userId, propertyId } = req.params;

        const unlock = await ContactUnlock.findOne({
            where: {
                tenantId: userId,
                propertyId,
                status: ContactUnlockStatus.ACTIVE
            }
        });

        res.json({ unlocked: !!unlock, unlockData: unlock });
    } catch (error) {
        console.error('Error checking contact unlock:', error);
        res.status(500).json({ error: 'Failed to check contact unlock', message: error.message });
    }
};

/**
 * Unlock property contact (deducts 1 credit or uses unlimited)
 */
export const unlockContact = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { tenantId, propertyId } = req.body;

        if (!tenantId || !propertyId) {
            await t.rollback();
            return res.status(400).json({ error: 'tenantId and propertyId are required' });
        }

        // 1. Verify user is tenant
        const tenant = await User.findByPk(tenantId, { transaction: t });
        if (!tenant || tenant.userType !== UserType.TENANT) {
            await t.rollback();
            return res.status(403).json({ error: 'Only tenants can unlock contacts' });
        }

        // 2. Verify property exists
        const property = await Property.findByPk(propertyId, { transaction: t });
        if (!property) {
            await t.rollback();
            return res.status(404).json({ error: 'Property not found' });
        }

        // 3. Verify not already unlocked
        const existingUnlock = await ContactUnlock.findOne({
            where: { tenantId, propertyId, status: ContactUnlockStatus.ACTIVE },
            transaction: t
        });

        if (existingUnlock) {
            await t.rollback();
            return res.status(400).json({ error: 'Contact already unlocked for this property' });
        }

        // 4. Check credits (skip if owner is trying to view their own, though route shouldn't be called)
        if (tenantId === property.ownerId) {
            await t.rollback();
            return res.status(400).json({ error: 'Owners do not need to unlock their own properties' });
        }

        const balance = await CreditBalance.findOne({ where: { userId: tenantId }, transaction: t });

        if (!balance) {
            await t.rollback();
            return res.status(403).json({ error: 'Insufficient credits. Please purchase a credit plan.' });
        }

        // Check if has unlimited active
        const hasUnlimited = balance.unlimitedUntil && new Date(balance.unlimitedUntil) > new Date();
        const hasCredits = balance.availableCredits > 0 || balance.availableCredits === -1;

        if (!hasUnlimited && !hasCredits) {
            await t.rollback();
            return res.status(403).json({ error: 'Insufficient credits. Please purchase a credit plan.' });
        }

        let transactionId = null;

        // 5. Deduct credit if not unlimited
        if (!hasUnlimited && balance.availableCredits !== -1) {
            balance.availableCredits -= 1;
            balance.totalUsed += 1;
            await balance.save({ transaction: t });

            // Create transaction log
            const creditTx = await CreditTransaction.create({
                userId: tenantId,
                type: CreditTransactionType.USE,
                amount: -1,
                balanceAfter: balance.availableCredits,
                description: `Desbloqueo de contacto para propiedad: ${property.title}`,
                referenceType: 'property_unlock',
                referenceId: propertyId
            }, { transaction: t });

            transactionId = creditTx.id;
        }

        // 6. Create ContactUnlock record
        const unlock = await ContactUnlock.create({
            tenantId,
            propertyId,
            ownerId: property.ownerId,
            creditTransactionId: transactionId,
            status: ContactUnlockStatus.ACTIVE
        }, { transaction: t });

        // Increment property interest count
        property.interestsCount += 1;
        await property.save({ transaction: t });

        // 7. Notify owner
        try {
            // Using existing notification service but can be extended
            await notificationService.notifyPropertyInterest(property.ownerId, propertyId, tenantId, property.title);
        } catch (notifError) {
            // Non-fatal if notification fails
            console.error('Failed to notify owner:', notifError);
        }

        // 8. Fetch owner details to return
        const owner = await User.findByPk(property.ownerId, {
            attributes: ['id', 'name', 'email', 'phone', 'whatsapp', 'plan'],
            transaction: t
        });

        await t.commit();

        res.json({
            success: true,
            unlockData: unlock,
            ownerContact: owner,
            remainingCredits: balance.availableCredits,
            hasUnlimited
        });
    } catch (error) {
        await t.rollback();
        console.error('Error unlocking contact:', error);
        res.status(500).json({ error: 'Failed to unlock contact', message: error.message });
    }
};

export default {
    getCreditBalance,
    getCreditTransactions,
    checkContactUnlocked,
    unlockContact
};
