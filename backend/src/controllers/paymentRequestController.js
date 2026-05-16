import { PaymentRequest, User, ActivityLog } from '../models/index.js';
import { PaymentRequestStatus, PlanType, UserType } from '../utils/enums.js';
import { notifyPaymentVerified, notifyPaymentRejected, notifyPaymentSubmitted } from '../services/notificationService.js';
import { badRequest, forbidden, notFound } from '../errors/AppError.js';


/**
 * PaymentRequest Controller
 * Handles manual payment proof submissions for premium plans
 */

// Get all payment requests (admin)
export const getAllPaymentRequests = async (req, res, next) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;

        const where = {};
        if (status) where.status = status;

        const requests = await PaymentRequest.findAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'phone', 'plan']
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json(requests);
    } catch (error) {
        next(error);
    }
};

// Get payment request by ID
export const getPaymentRequestById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const request = await PaymentRequest.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'phone', 'plan']
                }
            ]
        });

        if (!request) {
            return next(notFound('Payment request not found', { code: 'PAYMENT_REQUEST_NOT_FOUND' }));
        }

        if (request.userId !== req.auth.userId) {
            return next(forbidden('No tienes permiso para ver esta solicitud de pago', {
                code: 'PAYMENT_REQUEST_VIEW_FORBIDDEN'
            }));
        }

        res.json(request);
    } catch (error) {
        next(error);
    }
};

// Get user's payment requests
export const getUserPaymentRequests = async (req, res, next) => {
    try {
        const { userId } = req.params;

        if (req.auth.userId !== userId) {
            return next(forbidden('No tienes permiso para ver las solicitudes de pago de este usuario', {
                code: 'PAYMENT_REQUEST_USER_LIST_FORBIDDEN'
            }));
        }

        const requests = await PaymentRequest.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });

        res.json(requests);
    } catch (error) {
        next(error);
    }
};

// Create payment request
export const createPaymentRequest = async (req, res, next) => {
    try {
        const userId = req.auth.userId;
        const { amount, planType, planDuration, referenceCode, proofImageUrl, proofImagePublicId, paymentMethod, mercadoPagoPaymentId } = req.body;

        // Validate required fields
        if (!amount || !planType || planDuration === undefined || planDuration === null || !referenceCode) {
            return next(badRequest('Faltan campos requeridos', { code: 'PAYMENT_REQUEST_REQUIRED_FIELDS_MISSING' }));
        }

        // If it's a bank transfer, proofImageUrl is required
        if (paymentMethod !== 'mercado_pago' && !proofImageUrl) {
            return next(badRequest('El comprobante de pago es requerido para transferencias', { code: 'PAYMENT_PROOF_REQUIRED' }));
        }

        // Verify user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return next(notFound('User not found', { code: 'USER_NOT_FOUND' }));
        }

        // Check if user already has a pending payment request
        const existingPending = await PaymentRequest.findOne({
            where: {
                userId,
                status: PaymentRequestStatus.PENDING
            }
        });

        if (existingPending) {
            return next(badRequest(
                'Ya tienes una solicitud de pago pendiente. Por favor espera a que sea revisada antes de enviar otra.',
                { code: 'PAYMENT_REQUEST_ALREADY_PENDING' }
            ));
        }

        // Create payment request
        const request = await PaymentRequest.create({
            userId,
            amount,
            planType,
            planDuration,
            referenceCode,
            proofImageUrl: proofImageUrl || null,
            proofImagePublicId: proofImagePublicId || null,
            status: PaymentRequestStatus.PENDING,
            paymentMethod: paymentMethod || 'bank_transfer',
            mercadoPagoPaymentId: mercadoPagoPaymentId || null,
            createdAt: new Date()
        });

        // Notify all admins about new payment submission
        try {
            // Get all admin users
            const admins = await User.findAll({
                where: {
                    userType: [UserType.ADMIN, UserType.SUPER_ADMIN]
                },
                attributes: ['id']
            });

            // Send notification to each admin
            for (const admin of admins) {
                await notifyPaymentSubmitted({
                    adminId: admin.id,
                    userName: user.name,
                    planType,
                    amount,
                    referenceCode
                });
            }
        } catch (notifError) {
            console.error('Error sending admin notifications:', notifError);
            // Don't fail the request if notification fails
        }

        try {
            await ActivityLog.create({
                type: 'payment_submitted',
                message: `${user.name} envió comprobante de pago (${planType})`,
                userId: user.id,
                timestamp: new Date()
            });
        } catch (activityError) {
            console.error('Error creating activity log:', activityError);
        }

        res.status(201).json({
            message: 'Payment request submitted successfully',
            request: {
                id: request.id,
                status: request.status,
                proofImageUrl: request.proofImageUrl,
                createdAt: request.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};

// Verify/Approve payment request (admin)
export const verifyPaymentRequest = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Get payment request with user data
        const request = await PaymentRequest.findByPk(id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email', 'plan', 'premiumSince']
            }]
        });

        if (!request) {
            return next(notFound('Payment request not found', { code: 'PAYMENT_REQUEST_NOT_FOUND' }));
        }

        if (request.status !== PaymentRequestStatus.PENDING) {
            return next(badRequest('Payment request already processed', { code: 'PAYMENT_REQUEST_ALREADY_PROCESSED' }));
        }

        const user = request.user;
        const now = new Date();

        // 1. Update payment request status
        await request.update({
            status: PaymentRequestStatus.VERIFIED,
            processedAt: now
        });

        // Determine if it's a credit plan or owner premium plan
        const isCreditPlan = ['5_credits', '10_credits', '20_credits'].includes(request.planType);

        let subscriptionDetails = null;

        if (isCreditPlan) {
            // -- ALGORITHM FOR TENANT CREDITS --
            const { CreditBalance, CreditTransaction, Subscription } = await import('../models/index.js');

            let balance = await CreditBalance.findOne({ where: { userId: user.id } });

            if (!balance) {
                balance = await CreditBalance.create({
                    userId: user.id,
                    availableCredits: 0,
                    totalPurchased: 0,
                    totalUsed: 0,
                    totalRefunded: 0
                });
            }

            let creditsToAdd = 0;
            let unlimitedUntil = balance.unlimitedUntil;

            if (request.planType === '5_credits') creditsToAdd = 5;
            else if (request.planType === '10_credits') creditsToAdd = 10;
            else if (request.planType === '20_credits') creditsToAdd = 20;

            if (creditsToAdd > 0) {
                // If they had unlimited and now buy credits (rare), or just buying more credits
                if (balance.availableCredits !== -1) {
                    balance.availableCredits += creditsToAdd;
                }
                balance.totalPurchased += creditsToAdd;
            } else if (creditsToAdd === -1) {
                balance.availableCredits = -1;
                balance.unlimitedUntil = unlimitedUntil;
            }

            await balance.save();

            // Log the transaction
            await CreditTransaction.create({
                userId: user.id,
                type: 'purchase',
                amount: creditsToAdd,
                balanceAfter: balance.availableCredits,
                description: `Compra de plan de créditos: ${request.planType}`,
                referenceType: 'payment_request',
                referenceId: request.id
            });

            // We can also create a subscription record to keep track of the purchase history uniformly
            const expiresAt = new Date(now);
            expiresAt.setDate(expiresAt.getDate() + request.planDuration);

            const subscription = await Subscription.create({
                userId: user.id,
                plan: PlanType.FREE, // Tenants stay free but get credits
                planType: request.planType,
                startedAt: now,
                expiresAt: expiresAt,
                paymentRequestId: request.id,
                status: 'active',
                createdAt: now
            });

            subscriptionDetails = subscription;

            // Notify user of credit purchase
            const { notifyCreditPurchased } = await import('../services/notificationService.js');
            if (notifyCreditPurchased) {
                await notifyCreditPurchased({
                    userId: user.id,
                    userName: user.name,
                    planType: request.planType,
                    credits: creditsToAdd
                });
            }
        } else {
            // -- ALGORITHM FOR OWNER PREMIUM PLANS (Weekly, Monthly, Quarterly) --
            const expiresAt = new Date(now);
            expiresAt.setDate(expiresAt.getDate() + request.planDuration);

            // 2. Create new Subscription record
            const { Subscription } = await import('../models/index.js');
            const subscription = await Subscription.create({
                userId: user.id,
                plan: PlanType.PREMIUM,
                planType: request.planType,
                startedAt: now,
                expiresAt: expiresAt,
                paymentRequestId: request.id,
                status: 'active',
                createdAt: now
            });

            subscriptionDetails = subscription;

            // 3. Update User's plan
            await user.update({
                plan: PlanType.PREMIUM,
                premiumSince: user.premiumSince || now,
                updatedAt: now
            });

            // 5. Send notification to user
            await notifyPaymentVerified({
                userId: user.id,
                userName: user.name,
                planType: request.planType,
                expiresAt: subscription.expiresAt
            });
        }

        // 4. Create activity log (for both)
        const { ActivityLog } = await import('../models/index.js');
        await ActivityLog.create({
            type: 'payment_verified',
            message: `Pago verificado para ${user.name} - Plan ${request.planType} por ${request.planDuration} días`,
            userId: user.id,
            timestamp: now
        });

        res.json({
            message: 'Payment verified and plan activated',
            subscription: subscriptionDetails ? {
                id: subscriptionDetails.id,
                plan: subscriptionDetails.plan,
                planType: subscriptionDetails.planType,
                expiresAt: subscriptionDetails.expiresAt
            } : null,
            user: {
                id: user.id,
                plan: user.plan,
                premiumSince: user.premiumSince
            }
        });
    } catch (error) {
        next(error);
    }
};

// Reject payment request (admin)
export const rejectPaymentRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        // Get payment request with user data
        const request = await PaymentRequest.findByPk(id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name']
            }]
        });

        if (!request) {
            return next(notFound('Payment request not found', { code: 'PAYMENT_REQUEST_NOT_FOUND' }));
        }

        if (request.status !== PaymentRequestStatus.PENDING) {
            return next(badRequest('Payment request already processed', { code: 'PAYMENT_REQUEST_ALREADY_PROCESSED' }));
        }

        const now = new Date();

        // Update request status
        await request.update({
            status: PaymentRequestStatus.REJECTED,
            processedAt: now
        });

        // Optional: Delete proof image from Cloudinary to save space
        // Logic removed as part of Direct Upload migration (backend fully decoupled from Cloudinary management)
        // Image will remain in Cloudinary until manual cleanup or retention policy.

        // Create activity log
        const { ActivityLog } = await import('../models/index.js');
        await ActivityLog.create({
            type: 'payment_rejected',
            message: `Pago rechazado para ${request.user.name}${reason ? ` - Razón: ${reason}` : ''}`,
            userId: request.userId,
            timestamp: now
        });

        // Send notification to user
        await notifyPaymentRejected({
            userId: request.userId,
            userName: request.user.name,
            reason
        });

        res.json({
            message: 'Payment request rejected',
            request: {
                id: request.id,
                status: request.status
            }
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getAllPaymentRequests,
    getPaymentRequestById,
    getUserPaymentRequests,
    createPaymentRequest,
    verifyPaymentRequest,
    rejectPaymentRequest
};
