import { User, Property, CreditBalance, CreditTransaction, ContactUnlock, Notification } from '../models/index.js';
import { CreditTransactionType, ContactUnlockStatus, UserType } from '../utils/enums.js';
import notificationService from '../services/notificationService.js';
import { sequelize } from '../config/database.js';
import { AppError, badRequest, notFound, unauthorized } from '../errors/AppError.js';
import { ensureOwnUserOrAdmin } from '../utils/authorization.js';

const ensureCreditOwnerOrAdmin = (req, targetUserId, forbiddenCode) => ensureOwnUserOrAdmin(req, targetUserId, {
    authRequiredCode: 'CREDIT_AUTH_REQUIRED',
    authUserNotFoundCode: 'CREDIT_AUTH_USER_NOT_FOUND',
    forbiddenCode,
    forbiddenMessage: 'No tienes permiso para acceder a esta información de créditos'
});

/**
 * Get user's credit balance
 */
export const getCreditBalance = async (req, res, next) => {
    try {
        const { userId } = req.params;
        await ensureCreditOwnerOrAdmin(req, userId, 'CREDIT_BALANCE_FORBIDDEN');

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
        next(error);
    }
};

/**
 * Get user's credit transactions
 */
export const getCreditTransactions = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { limit = 20, offset = 0 } = req.query;
        await ensureCreditOwnerOrAdmin(req, userId, 'CREDIT_TRANSACTIONS_FORBIDDEN');

        const transactions = await CreditTransaction.findAll({
            where: { userId },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json(transactions);
    } catch (error) {
        next(error);
    }
};

/**
 * Check if a user has already unlocked a property
 */
export const checkContactUnlocked = async (req, res, next) => {
    try {
        const { userId, propertyId } = req.params;
        await ensureCreditOwnerOrAdmin(req, userId, 'CREDIT_UNLOCK_CHECK_FORBIDDEN');

        const unlock = await ContactUnlock.findOne({
            where: {
                tenantId: userId,
                propertyId,
                status: ContactUnlockStatus.ACTIVE
            }
        });

        res.json({ unlocked: !!unlock, unlockData: unlock });
    } catch (error) {
        next(error);
    }
};

/**
 * Unlock property contact (deducts 1 credit or uses unlimited)
 */
export const unlockContact = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        const tenantId = req.auth?.userId;
        const { propertyId } = req.body;

        if (!tenantId) {
            await t.rollback();
            return next(unauthorized('Autenticación requerida', {
                code: 'CREDIT_UNLOCK_AUTH_REQUIRED'
            }));
        }

        if (!propertyId) {
            await t.rollback();
            return next(badRequest('propertyId is required', {
                code: 'CREDIT_UNLOCK_REQUIRED_FIELDS'
            }));
        }

        // 1. Verify user is tenant
        const tenant = await User.findByPk(tenantId, { transaction: t });
        if (!tenant || tenant.userType !== UserType.TENANT) {
            await t.rollback();
            return next(new AppError('Only tenants can unlock contacts', 403, 'CREDIT_UNLOCK_ONLY_TENANTS'));
        }

        // 2. Verify property exists
        const property = await Property.findByPk(propertyId, { transaction: t });
        if (!property) {
            await t.rollback();
            return next(notFound('Property not found', { code: 'CREDIT_UNLOCK_PROPERTY_NOT_FOUND' }));
        }

        // 3. Verify not already unlocked
        const existingUnlock = await ContactUnlock.findOne({
            where: { tenantId, propertyId, status: ContactUnlockStatus.ACTIVE },
            transaction: t
        });

        if (existingUnlock) {
            await t.rollback();
            return next(badRequest('Contact already unlocked for this property', {
                code: 'CREDIT_UNLOCK_ALREADY_UNLOCKED'
            }));
        }

        // 4. Check credits (skip if owner is trying to view their own, though route shouldn't be called)
        if (tenantId === property.ownerId) {
            await t.rollback();
            return next(badRequest('Owners do not need to unlock their own properties', {
                code: 'CREDIT_UNLOCK_OWNER_NOT_REQUIRED'
            }));
        }

        const balance = await CreditBalance.findOne({ where: { userId: tenantId }, transaction: t });

        if (!balance) {
            await t.rollback();
            return next(new AppError(
                'No tienes suficientes créditos. Por favor adquiere un plan.',
                403,
                'CREDIT_UNLOCK_INSUFFICIENT_CREDITS'
            ));
        }

        // Check if has unlimited active
        const hasUnlimited = balance.unlimitedUntil && new Date(balance.unlimitedUntil) > new Date();
        const hasCredits = balance.availableCredits > 0 || balance.availableCredits === -1;

        if (!hasUnlimited && !hasCredits) {
            await t.rollback();
            return next(new AppError(
                'No tienes suficientes créditos. Por favor adquiere un plan.',
                403,
                'CREDIT_UNLOCK_INSUFFICIENT_CREDITS'
            ));
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
        next(error);
    }
};

export default {
    getCreditBalance,
    getCreditTransactions,
    checkContactUnlocked,
    unlockContact
};
