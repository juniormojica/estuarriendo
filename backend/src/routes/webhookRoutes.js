import express from 'express';
// Note: We use dynamic imports for controllers inside the route to avoid circular dependency issues if any
const router = express.Router();

router.post('/mercadopago', async (req, res) => {
    try {
        const { default: webhookController } = await import('../controllers/webhookController.js');
        await webhookController.handleMercadoPagoWebhook(req, res);
    } catch (error) {
        console.error('Error routing webhook:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
