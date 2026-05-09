import { afterEach, describe, expect, it, vi } from 'vitest';
import * as verificationController from './verificationController.js';
import { ActivityLog, Notification, User, UserVerification, UserVerificationDocuments } from '../models/index.js';

const createRes = () => {
    const res = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
};

describe('verificationController ActivityLog parity', () => {
    afterEach(() => vi.restoreAllMocks());

    it('creates verification_submitted activity on successful document batch submit', async () => {
        vi.spyOn(User, 'findByPk').mockResolvedValue({ id: 'u-1', name: 'Ana', update: vi.fn() });
        vi.spyOn(UserVerificationDocuments, 'findByPk').mockResolvedValue(null);
        vi.spyOn(UserVerificationDocuments, 'create').mockResolvedValue({ userId: 'u-1', submittedAt: new Date() });
        vi.spyOn(UserVerification, 'findOrCreate').mockResolvedValue([{ update: vi.fn() }, true]);
        vi.spyOn(User, 'findAll').mockResolvedValue([]);
        vi.spyOn(Notification, 'create').mockResolvedValue({});
        const activitySpy = vi.spyOn(ActivityLog, 'create').mockResolvedValue({ id: 'log-1' });

        const req = { body: { userId: 'u-1', idFront: 'a', idBack: 'b', selfie: 'c' } };
        const res = createRes();

        await verificationController.submitVerificationDocuments(req, res);

        expect(activitySpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'verification_submitted', userId: 'u-1' }));
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('creates verification_doc_submitted activity on successful single document submit', async () => {
        vi.spyOn(User, 'findByPk').mockResolvedValue({
            id: 'u-1',
            name: 'Ana',
            verificationStatus: 'not_submitted',
            save: vi.fn()
        });
        vi.spyOn(UserVerificationDocuments, 'findOrCreate').mockResolvedValue([{
            idFrontStatus: 'not_submitted',
            save: vi.fn()
        }, false]);
        vi.spyOn(User, 'findOne').mockResolvedValue(null);
        vi.spyOn(Notification, 'create').mockResolvedValue({});
        const activitySpy = vi.spyOn(ActivityLog, 'create').mockResolvedValue({ id: 'log-2' });

        const req = {
            body: {
                userId: 'u-1',
                documentType: 'idFront',
                documentUrl: 'https://cdn/doc.png'
            }
        };
        const res = createRes();

        await verificationController.submitSingleDocument(req, res);

        expect(activitySpy).toHaveBeenCalledWith(expect.objectContaining({
            type: 'verification_doc_submitted',
            userId: 'u-1'
        }));
        expect(res.json).toHaveBeenCalled();
    });
});
