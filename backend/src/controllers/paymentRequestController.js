import { PaymentRequest, User } from '../models/index.js';
import { PaymentRequestStatus, PlanType } from '../utils/enums.js';

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
        const { userId, userName, amount, planType, planDuration, referenceCode, proofImage } = req.body;

        // Validate required fields
        if (!userId || !userName || !amount || !planType || !planDuration || !referenceCode || !proofImage) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Verify user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const request = await PaymentRequest.create({
            userId,
            userName,
            amount,
            planType,
            planDuration,
            referenceCode,
            proofImage,
            status: PaymentRequestStatus.PENDING,
            createdAt: new Date()
        });

        res.status(201).json(request);
    } catch (error) {
        console.error('Error creating payment request:', error);
        res.status(500).json({ error: 'Failed to create payment request', message: error.message });
    }
};

// Verify/Approve payment request (admin)
export const verifyPaymentRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await PaymentRequest.findByPk(id);
        if (!request) {
            return res.status(404).json({ error: 'Payment request not found' });
        }

        if (request.status !== PaymentRequestStatus.PENDING) {
            return res.status(400).json({ error: 'Payment request already processed' });
        }

        // Update request status
        await request.update({
            status: PaymentRequestStatus.VERIFIED,
            processedAt: new Date()
        });

        // Update user's plan
        const user = await User.findByPk(request.userId);
        if (user) {
            const now = new Date();
            const expiresAt = new Date(now);
            expiresAt.setDate(expiresAt.getDate() + request.planDuration);

            await user.update({
                plan: PlanType.PREMIUM,
                planType: request.planType,
                planStartedAt: now,
                planExpiresAt: expiresAt,
                paymentRequestId: request.id,
                premiumSince: user.premiumSince || now,
                updatedAt: now
            });
        }

        res.json({
            message: 'Payment verified and plan activated',
            request,
            user: {
                id: user.id,
                plan: user.plan,
                planExpiresAt: user.planExpiresAt
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

        const request = await PaymentRequest.findByPk(id);
        if (!request) {
            return res.status(404).json({ error: 'Payment request not found' });
        }

        if (request.status !== PaymentRequestStatus.PENDING) {
            return res.status(400).json({ error: 'Payment request already processed' });
        }

        await request.update({
            status: PaymentRequestStatus.REJECTED,
            processedAt: new Date()
        });

        res.json({
            message: 'Payment request rejected',
            request
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
