import express from 'express';
import creditController from '../controllers/creditController.js';

const router = express.Router();

router.get('/:userId', creditController.getCreditBalance);
router.get('/:userId/transactions', creditController.getCreditTransactions);
router.get('/check-unlock/:userId/:propertyId', creditController.checkContactUnlocked);
router.post('/unlock-contact', creditController.unlockContact);

export default router;
