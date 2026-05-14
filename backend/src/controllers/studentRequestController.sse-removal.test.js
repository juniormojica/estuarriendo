import { afterEach, describe, expect, it, vi } from 'vitest';
import * as studentRequestController from './studentRequestController.js';
import { ActivityLog, StudentRequest, User } from '../models/index.js';

const createRes = () => {
    const res = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
};

describe('studentRequestController ActivityLog parity', () => {
    afterEach(() => vi.restoreAllMocks());

    it('creates student_request_created activity when request is created', async () => {
        vi.spyOn(User, 'findByPk').mockResolvedValue({ id: 'u-10' });
        vi.spyOn(StudentRequest, 'create').mockResolvedValue({ id: 'sr-1', status: 'open' });
        const activitySpy = vi.spyOn(ActivityLog, 'create').mockResolvedValue({ id: 'log-1' });

        const req = {
            auth: { userId: 'u-10' },
            body: {
                cityId: 1,
                budgetMax: 1000,
                propertyTypeDesired: 'room',
                moveInDate: '2026-06-01'
            }
        };
        const res = createRes();

        await studentRequestController.createStudentRequest(req, res);

        expect(activitySpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'student_request_created', userId: 'u-10' }));
        expect(res.status).toHaveBeenCalledWith(201);
    });
});
