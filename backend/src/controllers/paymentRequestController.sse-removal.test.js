import { afterEach, describe, expect, it, vi } from 'vitest';
import * as paymentRequestController from './paymentRequestController.js';
import { ActivityLog, PaymentRequest, User } from '../models/index.js';

const createRes = () => {
    const res = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
};

describe('paymentRequestController ActivityLog parity', () => {
    afterEach(() => vi.restoreAllMocks());

    it('creates payment_submitted activity on successful request', async () => {
        vi.spyOn(User, 'findByPk').mockResolvedValue({ id: 'u-1', name: 'Ana' });
        vi.spyOn(PaymentRequest, 'findOne').mockResolvedValue(null);
        vi.spyOn(PaymentRequest, 'create').mockResolvedValue({
            id: 'pr-1',
            status: 'pending',
            proofImageUrl: 'https://cdn/img.png',
            createdAt: new Date()
        });
        vi.spyOn(User, 'findAll').mockResolvedValue([]);
        const activitySpy = vi.spyOn(ActivityLog, 'create').mockResolvedValue({ id: 'log-1' });

        const req = {
            auth: { userId: 'u-1' },
            body: {
                amount: 10000,
                planType: 'monthly',
                planDuration: 30,
                referenceCode: 'REF-123',
                proofImageUrl: 'https://cdn/img.png'
            }
        };
        const res = createRes();

        await paymentRequestController.createPaymentRequest(req, res, vi.fn());

        expect(activitySpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'payment_submitted', userId: 'u-1' }));
        expect(res.status).toHaveBeenCalledWith(201);
    });
});
