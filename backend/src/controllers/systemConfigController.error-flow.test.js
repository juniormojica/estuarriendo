import { afterEach, describe, expect, it, vi } from 'vitest';
import * as systemConfigController from './systemConfigController.js';
import { SystemConfig } from '../models/index.js';
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

describe('systemConfigController incremental migration -> centralized errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns standardized 404 contract when config is missing', async () => {
        vi.spyOn(SystemConfig, 'findOne').mockResolvedValue(null);

        const req = { params: { key: 'commissionRate' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            systemConfigController.getConfigValue,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'System config not found',
            message: 'System config not found',
            code: 'SYSTEM_CONFIG_NOT_FOUND'
        });
    });

    it('returns standardized 400 contract when value is missing', async () => {
        const req = { params: { key: 'commissionRate' }, body: {} };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            systemConfigController.updateConfigValue,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Value is required',
            message: 'Value is required',
            code: 'SYSTEM_CONFIG_VALUE_REQUIRED'
        });
    });

    it('forwards updateSystemConfig unexpected errors to centralized errorHandler', async () => {
        vi.spyOn(SystemConfig, 'findOne').mockRejectedValue(new Error('db exploded'));

        const req = { body: { commissionRate: 0.1 } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            systemConfigController.updateSystemConfig,
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
