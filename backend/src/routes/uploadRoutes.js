import express from 'express';
import { generateSignature } from '../controllers/signatureController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/upload/signature
 * @desc    Generate signature for client-side upload
 * @access  Private (requires authentication)
 */
router.get('/signature', authMiddleware, generateSignature);

export default router;
