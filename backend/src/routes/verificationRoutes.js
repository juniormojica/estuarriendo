import express from 'express';
import {
    submitVerificationDocuments,
    getVerificationDocuments,
    getPendingVerifications,
    approveVerification,
    rejectVerification,
    submitSingleDocument,
    getVerificationProgress,
    reviewSingleDocument
} from '../controllers/verificationController.js';

const router = express.Router();

// Get all pending verifications (admin)
router.get('/pending/all', getPendingVerifications);

// ----------------------------------------
// INDIVIDUAL DOCUMENT REVIEW
// ----------------------------------------
router.get('/progress/:userId', getVerificationProgress);
router.post('/document/submit', submitSingleDocument);
router.patch('/document/:userId/review', reviewSingleDocument);

// ----------------------------------------
// LEGACY BATCH REVIEW (Fallback)
// ----------------------------------------
// Submit verification documents
router.post('/submit', submitVerificationDocuments);

// Get verification documents (admin)
router.get('/:userId', getVerificationDocuments);

// Approve verification (admin)
router.put('/:userId/approve', approveVerification);

// Reject verification (admin)
router.put('/:userId/reject', rejectVerification);

export default router;
