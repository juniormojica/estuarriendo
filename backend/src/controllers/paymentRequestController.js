import { PaymentRequest, User } from '../models/index.js';
import { PaymentRequestStatus, PlanType } from '../utils/enums.js';
import { notifyPaymentVerified, notifyPaymentRejected, notifyPaymentSubmitted } from '../services/notificationService.js';

/**
 * PaymentRequest Controller
 * Handles manual payment proof submissions for premium plans
 */

// Get all payment requests (admin)
export const getAllPaymentRequests = async (req, res) => {
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
        console.error('Error fetching payment requests:', error);
        res.status(500).json({ error: 'Failed to fetch payment requests', message: error.message });
    }
};

// Get payment request by ID
export const getPaymentRequestById = async (req, res) => {
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
            return res.status(404).json({ error: 'Payment request not found' });
        }

        res.json(request);
    } catch (error) {
        console.error('Error fetching payment request:', error);
        res.status(500).json({ error: 'Failed to fetch payment request', message: error.message });
    }
};

// Get user's payment requests
export const getUserPaymentRequests = async (req, res) => {
    try {
        const { userId } = req.params;

        const requests = await PaymentRequest.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });

        res.json(requests);
    } catch (error) {
        console.error('Error fetching user payment requests:', error);
        res.status(500).json({ error: 'Failed to fetch user payment requests', message: error.message });
    }
};

// Create payment request
export const createPaymentRequest = async (req, res) => {
    try {
        const { userId, amount, planType, planDuration, referenceCode, proofImageUrl, proofImagePublicId, paymentMethod, mercadoPagoPaymentId } = req.body;

        // Validate required fields
        if (!userId || !amount || !planType || planDuration === undefined || planDuration === null || !referenceCode) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        // If it's a bank transfer, proofImageUrl is required
        if (paymentMethod !== 'mercado_pago' && !proofImageUrl) {
            return res.status(400).json({ error: 'El comprobante de pago es requerido para transferencias' });
        }

        // Verify user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user already has a pending payment request
        const existingPending = await PaymentRequest.findOne({
            where: {
                userId,
                status: PaymentRequestStatus.PENDING
            }
        });

        if (existingPending) {
            return res.status(400).json({
                error: 'Ya tienes una solicitud de pago pendiente. Por favor espera a que sea revisada antes de enviar otra.'
            });
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
                    userType: ['admin', 'superAdmin']
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
        console.error('Error creating payment request:', error);
        res.status(500).json({ error: 'Failed to create payment request', message: error.message });
    }
};

// Verify/Approve payment request (admin)
export const verifyPaymentRequest = async (req, res) => {
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
            return res.status(404).json({ error: 'Payment request not found' });
        }

        if (request.status !== PaymentRequestStatus.PENDING) {
            return res.status(400).json({ error: 'Payment request already processed' });
        }

        const user = request.user;
        const now = new Date();

        // 1. Update payment request status
        await request.update({
            status: PaymentRequestStatus.VERIFIED,
            processedAt: now
        });

        // Determine if it's a credit plan or owner premium plan
        const isCreditPlan = ['5_credits', '10_credits', 'unlimited'].includes(request.planType);

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
            else if (request.planType === 'unlimited') {
                creditsToAdd = -1; // -1 represents unlimited
                unlimitedUntil = new Date(now);
                unlimitedUntil.setDate(unlimitedUntil.getDate() + 30); // 30 days of unlimited
            }

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
        console.error('Error verifying payment request:', error);
        res.status(500).json({ error: 'Failed to verify payment request', message: error.message });
    }
};

// Reject payment request (admin)
export const rejectPaymentRequest = async (req, res) => {
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
            return res.status(404).json({ error: 'Payment request not found' });
        }

        if (request.status !== PaymentRequestStatus.PENDING) {
            return res.status(400).json({ error: 'Payment request already processed' });
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
        console.error('Error rejecting payment request:', error);
        res.status(500).json({ error: 'Failed to reject payment request', message: error.message });
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
