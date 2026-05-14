import { afterEach, describe, expect, it, vi } from 'vitest';
import * as propertyReportController from './propertyReportController.js';
import { PropertyReport, Property, ReportActivityLog, User } from '../models/index.js';

const createReq = (overrides = {}) => ({
    auth: { userId: 'user-own' },
    ...overrides
});

const createRes = () => {
    const res = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
};

describe('getMyPropertyReports', () => {
    afterEach(() => vi.restoreAllMocks());

    it('returns only reports belonging to the authenticated user', async () => {
        const mockReports = [
            { id: 'r-1', reporterId: 'user-own', propertyId: 'p-1', status: 'pending' },
            { id: 'r-2', reporterId: 'user-own', propertyId: 'p-2', status: 'confirmed' }
        ];
        const findAllSpy = vi.spyOn(PropertyReport, 'findAll').mockResolvedValue(mockReports);

        const req = createReq();
        const res = createRes();

        await propertyReportController.getMyPropertyReports(req, res, vi.fn());

        expect(findAllSpy).toHaveBeenCalledTimes(1);
        // Must scope query to the authenticated user's ID
        expect(findAllSpy).toHaveBeenCalledWith(expect.objectContaining({
            where: { reporterId: 'user-own' }
        }));
        expect(res.json).toHaveBeenCalledWith(mockReports);
    });

    it('does NOT accept reporterId from query parameters', async () => {
        const findAllSpy = vi.spyOn(PropertyReport, 'findAll').mockResolvedValue([]);

        const req = createReq({ query: { reporterId: 'user-evil' } });
        const res = createRes();

        await propertyReportController.getMyPropertyReports(req, res, vi.fn());

        // Must still use auth userId, never the query param
        expect(findAllSpy).toHaveBeenCalledWith(expect.objectContaining({
            where: { reporterId: 'user-own' }
        }));
    });

    it('returns empty array when user has no reports', async () => {
        vi.spyOn(PropertyReport, 'findAll').mockResolvedValue([]);

        const req = createReq();
        const res = createRes();

        await propertyReportController.getMyPropertyReports(req, res, vi.fn());

        expect(res.json).toHaveBeenCalledWith([]);
    });

    it('includes property id and title (no owner PII)', async () => {
        vi.spyOn(PropertyReport, 'findAll').mockResolvedValue([]);

        const req = createReq();
        const res = createRes();

        await propertyReportController.getMyPropertyReports(req, res, vi.fn());

        const callArgs = PropertyReport.findAll.mock.calls[0][0];
        const propertyInclude = callArgs.include.find(i => i.as === 'property');

        expect(propertyInclude).toBeDefined();
        expect(propertyInclude.attributes).toEqual(['id', 'title']);
    });

    it('includes activity logs with admin name only', async () => {
        vi.spyOn(PropertyReport, 'findAll').mockResolvedValue([]);

        const req = createReq();
        const res = createRes();

        await propertyReportController.getMyPropertyReports(req, res, vi.fn());

        const callArgs = PropertyReport.findAll.mock.calls[0][0];
        const activityInclude = callArgs.include.find(i => i.as === 'activityLogs');

        expect(activityInclude).toBeDefined();
        expect(activityInclude.include[0].as).toBe('admin');
        expect(activityInclude.include[0].attributes).toEqual(['id', 'name']);
    });

    it('forwards errors to next()', async () => {
        const dbError = new Error('DB connection lost');
        vi.spyOn(PropertyReport, 'findAll').mockRejectedValue(dbError);

        const req = createReq();
        const res = createRes();
        const next = vi.fn();

        await propertyReportController.getMyPropertyReports(req, res, next);

        expect(next).toHaveBeenCalledWith(dbError);
        expect(res.json).not.toHaveBeenCalled();
    });
});
