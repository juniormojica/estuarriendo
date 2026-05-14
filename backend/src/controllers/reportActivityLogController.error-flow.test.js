import { afterEach, describe, expect, it, vi } from 'vitest';
import * as reportActivityLogController from './reportActivityLogController.js';
import { PropertyReport, ReportActivityLog } from '../models/index.js';
import { errorHandler } from '../middleware/errorHandler.js';

const createResponse = () => {
    const res = {};
    res.headersSent = false;
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
};

const runThroughErrorHandler = async (controllerAction, { req }) => {
    const res = createResponse();
    let capturedError;

    await controllerAction(req, res, (error) => {
        capturedError = error;
    });

    const statusCallsBeforeHandler = res.status.mock.calls.length;
    const jsonCallsBeforeHandler = res.json.mock.calls.length;

    errorHandler(capturedError, req, res, vi.fn());
    return { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler };
};

describe('reportActivityLogController incremental migration -> centralized errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('delegates addReportActivity validation failures to standardized 400 contract', async () => {
        const req = {
            auth: { userId: 1 },
            params: { id: '1' },
            body: { action: null, notes: null }
        };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            reportActivityLogController.addReportActivity,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'action and notes are required',
            message: 'action and notes are required',
            code: 'REPORT_ACTIVITY_VALIDATION_ERROR'
        });
    });

    it('delegates addReportActivity missing-report flow to standardized 404 contract', async () => {
        vi.spyOn(PropertyReport, 'findByPk').mockResolvedValue(null);

        const req = {
            auth: { userId: 1 },
            params: { id: '404' },
            body: { action: 'review', notes: 'start review' }
        };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            reportActivityLogController.addReportActivity,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Reporte no encontrado',
            message: 'Reporte no encontrado',
            code: 'REPORT_NOT_FOUND'
        });
    });

    it('delegates getReportActivity unexpected errors to centralized internal-error contract', async () => {
        vi.spyOn(ReportActivityLog, 'findAll').mockRejectedValue(new Error('query exploded'));

        const req = { params: { id: '1' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            reportActivityLogController.getReportActivity,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });
});
