import express from 'express';
import {
    getAllPaymentRequests,
    getPaymentRequestById,
    getUserPaymentRequests,
    createPaymentRequest,
    verifyPaymentRequest,
    rejectPaymentRequest
} from '../controllers/paymentRequestController.js';

const router = express.Router();

// Get all payment requests (admin)
router.get('/', getAllPaymentRequests);

// Get payment request by ID
router.get('/:id', getPaymentRequestById);

// Get user's payment requests
router.get('/user/:userId', getUserPaymentRequests);

// Create payment request
router.post('/', createPaymentRequest);

// Verify payment request (admin)
router.put('/:id/verify', verifyPaymentRequest);

// Reject payment request (admin)
router.put('/:id/reject', rejectPaymentRequest);

export default router;
