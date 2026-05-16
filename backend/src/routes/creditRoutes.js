import express from 'express';
import creditController from '../controllers/creditController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/:userId', authMiddleware, creditController.getCreditBalance);
router.get('/:userId/transactions', authMiddleware, creditController.getCreditTransactions);
router.get('/check-unlock/:userId/:propertyId', authMiddleware, creditController.checkContactUnlocked);
router.post('/unlock-contact', authMiddleware, creditController.unlockContact);

export default router;
