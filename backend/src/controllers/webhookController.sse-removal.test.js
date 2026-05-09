import { afterEach, describe, expect, it, vi } from 'vitest';
import { ActivityLog, Subscription, User } from '../models/index.js';

vi.mock('../services/notificationService.js', () => ({
    notifyPaymentVerified: vi.fn(),
    notifyCreditPurchased: vi.fn()
}));

vi.mock('mercadopago', () => ({
    MercadoPagoConfig: class {},
    Payment: class {
        async get() {
            return {
                id: 991,
                status: 'approved',
                external_reference: 'userId:u-1|planType:monthly'
            };
        }
    }
}));

describe('webhookController ActivityLog parity', () => {
    afterEach(() => vi.restoreAllMocks());

    it('logs payment_auto_verified when approved payment is processed', async () => {
        const { handleMercadoPagoWebhook } = await import('./webhookController.js');

        vi.spyOn(ActivityLog, 'findOne').mockResolvedValue(null);
        vi.spyOn(User, 'findByPk').mockResolvedValue({ id: 'u-1', name: 'Ana', premiumSince: null, update: vi.fn() });
        vi.spyOn(Subscription, 'create').mockResolvedValue({ id: 'sub-1' });
        const activitySpy = vi.spyOn(ActivityLog, 'create').mockResolvedValue({ id: 'log-1' });

        const req = { body: { type: 'payment', action: 'updated', data: { id: 991 } } };
        const res = { status: vi.fn(() => res), send: vi.fn(() => res) };

        await handleMercadoPagoWebhook(req, res);
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(activitySpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'payment_auto_verified', userId: 'u-1' }));
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
