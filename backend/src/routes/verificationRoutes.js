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
import authMiddleware from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';

const router = express.Router();

// Admin: pending verifications list
router.get('/pending/all', authMiddleware, requireAdmin, getPendingVerifications);

// ----------------------------------------
// INDIVIDUAL DOCUMENT REVIEW
// ----------------------------------------
router.get('/progress/:userId', authMiddleware, getVerificationProgress);
router.post('/document/submit', authMiddleware, submitSingleDocument);
router.patch('/document/:userId/review', authMiddleware, requireAdmin, reviewSingleDocument);

// ----------------------------------------
// LEGACY BATCH REVIEW (Fallback)
// ----------------------------------------
// Submit verification documents
router.post('/submit', authMiddleware, submitVerificationDocuments);

// Admin: document retrieval and approval
router.get('/:userId', authMiddleware, requireAdmin, getVerificationDocuments);
router.put('/:userId/approve', authMiddleware, requireAdmin, approveVerification);
router.put('/:userId/reject', authMiddleware, requireAdmin, rejectVerification);

export default router;
