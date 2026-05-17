import { afterEach, describe, expect, it, vi } from 'vitest';
import { ActivityLog, CreditTransaction, Subscription, User } from '../models/index.js';
import crypto from 'crypto';

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
    afterEach(() => {
        vi.restoreAllMocks();
        delete process.env.MP_WEBHOOK_SECRET;
    });

    it('logs payment_auto_verified when approved payment is processed', async () => {
        const { handleMercadoPagoWebhook } = await import('./webhookController.js');

        vi.spyOn(CreditTransaction, 'findOne').mockResolvedValue(null);
        vi.spyOn(ActivityLog, 'findOne').mockResolvedValue(null);
        vi.spyOn(User, 'findByPk').mockResolvedValue({ id: 'u-1', name: 'Ana', premiumSince: null, update: vi.fn() });
        vi.spyOn(Subscription, 'create').mockResolvedValue({ id: 'sub-1' });
        const activitySpy = vi.spyOn(ActivityLog, 'create').mockResolvedValue({ id: 'log-1' });

        const req = { body: { type: 'payment', action: 'updated', data: { id: 991 } } };
        const res = { status: vi.fn(() => res), send: vi.fn(() => res) };

        await handleMercadoPagoWebhook(req, res);

        expect(activitySpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'payment_auto_verified', userId: 'u-1' }));
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('rejects webhook when secret is configured and signature headers are missing', async () => {
        process.env.MP_WEBHOOK_SECRET = 'secret-test';

        const { handleMercadoPagoWebhook } = await import('./webhookController.js');
        const req = { body: { type: 'payment', data: { id: 991 } }, headers: {}, query: {} };
        const res = { status: vi.fn(() => res), json: vi.fn(() => res) };

        await handleMercadoPagoWebhook(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'MP_WEBHOOK_SIGNATURE_REQUIRED' }));
    });

    it('accepts webhook with valid MercadoPago-style signature when secret is configured', async () => {
        process.env.MP_WEBHOOK_SECRET = 'secret-test';
        const requestId = 'req-123';
        const ts = '1710000000';
        const notificationId = '991';
        const manifest = `id:${notificationId};request-id:${requestId};ts:${ts};`;
        const v1 = crypto.createHmac('sha256', process.env.MP_WEBHOOK_SECRET).update(manifest).digest('hex');

        const { handleMercadoPagoWebhook } = await import('./webhookController.js');
        vi.spyOn(CreditTransaction, 'findOne').mockResolvedValue(null);
        vi.spyOn(ActivityLog, 'findOne').mockResolvedValue(null);
        vi.spyOn(User, 'findByPk').mockResolvedValue({ id: 'u-1', name: 'Ana', premiumSince: null, update: vi.fn() });
        vi.spyOn(Subscription, 'create').mockResolvedValue({ id: 'sub-1' });
        vi.spyOn(ActivityLog, 'create').mockResolvedValue({ id: 'log-1' });

        const req = {
            body: { type: 'payment', action: 'updated', data: { id: 991 } },
            query: {},
            headers: { 'x-request-id': requestId, 'x-signature': `ts=${ts},v1=${v1}` }
        };
        const res = { status: vi.fn(() => res), send: vi.fn(() => res), json: vi.fn(() => res) };

        await handleMercadoPagoWebhook(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith('OK');
    });
});
