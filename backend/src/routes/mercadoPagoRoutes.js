import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';
// Use dynamic import for controllers inside route logic
const router = express.Router();

router.post('/create-preference', authMiddleware, async (req, res, next) => {
    try {
        const { default: mercadoPagoController } = await import('../controllers/mercadoPagoController.js');
        await mercadoPagoController.createCheckoutLink(req, res, next);
    } catch (error) {
        console.error('Error in /create-preference:', error);
        next(error);
    }
});

// Manual verification endpoint for debugging
router.get('/verify-payment/:paymentId', authMiddleware, requireAdmin, async (req, res, next) => {
    try {
        const { default: mercadoPagoController } = await import('../controllers/mercadoPagoController.js');
        await mercadoPagoController.verifyPaymentManually(req, res, next);
    } catch (error) {
        console.error('Error in /verify-payment:', error);
        next(error);
    }
});

export default router;
