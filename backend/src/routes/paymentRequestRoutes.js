import express from 'express';
import {
    getAllPaymentRequests,
    getPaymentRequestById,
    getUserPaymentRequests,
    createPaymentRequest,
    verifyPaymentRequest,
    rejectPaymentRequest
} from '../controllers/paymentRequestController.js';
import authMiddleware from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';

const router = express.Router();

// Payment request listing (admin)
router.get('/', authMiddleware, requireAdmin, getAllPaymentRequests);

// User-facing routes
router.get('/:id', getPaymentRequestById);
router.get('/user/:userId', getUserPaymentRequests);
router.post('/', createPaymentRequest);

// Payment verification (admin)
router.put('/:id/verify', authMiddleware, requireAdmin, verifyPaymentRequest);
router.put('/:id/reject', authMiddleware, requireAdmin, rejectPaymentRequest);

export default router;
