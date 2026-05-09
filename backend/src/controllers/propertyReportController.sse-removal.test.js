import { afterEach, describe, expect, it, vi } from 'vitest';
import * as propertyReportController from './propertyReportController.js';
import { ActivityLog, ContactUnlock, Notification, Property, PropertyReport, User } from '../models/index.js';

const createRes = () => {
    const res = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
};

describe('propertyReportController ActivityLog parity', () => {
    afterEach(() => vi.restoreAllMocks());

    it('creates property_report_created activity on successful report', async () => {
        vi.spyOn(ContactUnlock, 'findOne').mockResolvedValue({ id: 'unlock-1' });
        vi.spyOn(PropertyReport, 'findOne').mockResolvedValue(null);
        vi.spyOn(PropertyReport, 'create').mockResolvedValue({ id: 'report-1' });
        vi.spyOn(User, 'findAll').mockResolvedValue([]);
        vi.spyOn(Property, 'findByPk').mockResolvedValue({ id: 1, title: 'Depto' });
        vi.spyOn(Notification, 'bulkCreate').mockResolvedValue([]);
        const activitySpy = vi.spyOn(ActivityLog, 'create').mockResolvedValue({ id: 'log-1' });

        const req = { body: { reporterId: 'u-10', propertyId: 'p-1', reason: 'scam' } };
        const res = createRes();

        await propertyReportController.createPropertyReport(req, res);

        expect(activitySpy).toHaveBeenCalledWith(expect.objectContaining({
            type: 'property_report_created',
            userId: 'u-10',
            propertyId: 'p-1'
        }));
        expect(res.status).toHaveBeenCalledWith(201);
    });
});
