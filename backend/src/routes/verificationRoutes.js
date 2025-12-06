import express from 'express';
import {
    submitVerificationDocuments,
    getVerificationDocuments,
    getPendingVerifications,
    approveVerification,
    rejectVerification
} from '../controllers/verificationController.js';

const router = express.Router();

// Submit verification documents
router.post('/submit', submitVerificationDocuments);

// Get verification documents (admin)
router.get('/:userId', getVerificationDocuments);

// Get all pending verifications (admin)
router.get('/pending/all', getPendingVerifications);

// Approve verification (admin)
router.put('/:userId/approve', approveVerification);

// Reject verification (admin)
router.put('/:userId/reject', rejectVerification);

export default router;
