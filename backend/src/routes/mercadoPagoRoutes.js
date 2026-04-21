import express from 'express';
// Use dynamic import for controllers inside route logic
const router = express.Router();

router.post('/create-preference', async (req, res) => {
    try {
        const { default: mercadoPagoController } = await import('../controllers/mercadoPagoController.js');
        await mercadoPagoController.createCheckoutLink(req, res);
    } catch (error) {
        console.error('Error in /create-preference:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Manual verification endpoint for debugging
router.get('/verify-payment/:paymentId', async (req, res) => {
    try {
        const { default: mercadoPagoController } = await import('../controllers/mercadoPagoController.js');
        await mercadoPagoController.verifyPaymentManually(req, res);
    } catch (error) {
        console.error('Error in /verify-payment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
