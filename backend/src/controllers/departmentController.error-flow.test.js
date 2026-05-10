import { afterEach, describe, expect, it, vi } from 'vitest';
import * as departmentController from './departmentController.js';
import { Department } from '../models/index.js';
import { errorHandler } from '../middleware/errorHandler.js';

const createResponse = () => {
    const res = {};
    res.headersSent = false;
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
};

describe('departmentController incremental migration -> centralized errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('delegates delete missing-resource flow to centralized handler', async () => {
        vi.spyOn(Department, 'findByPk').mockResolvedValue(null);

        const req = { params: { id: '999' } };
        const res = createResponse();
        let capturedError;

        await departmentController.deleteDepartment(req, res, (error) => {
            capturedError = error;
        });

        const statusCallsBeforeHandler = res.status.mock.calls.length;
        const jsonCallsBeforeHandler = res.json.mock.calls.length;

        errorHandler(capturedError, req, res, vi.fn());

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Department not found',
            message: 'Department not found',
            code: 'DEPARTMENT_NOT_FOUND'
        });
    });
});
