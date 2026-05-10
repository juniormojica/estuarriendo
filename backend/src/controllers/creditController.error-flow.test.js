import { afterEach, describe, expect, it, vi } from 'vitest';
import * as creditController from './creditController.js';
import { CreditBalance, User } from '../models/index.js';
import { sequelize } from '../config/database.js';
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

describe('creditController incremental migration -> centralized errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('delegates getCreditBalance unexpected errors to centralized internal-error contract', async () => {
        vi.spyOn(CreditBalance, 'findOne').mockRejectedValue(new Error('db down'));

        const req = { params: { userId: '1' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            creditController.getCreditBalance,
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

    it('delegates unlockContact required-fields validation to standardized 400 contract after rollback', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);
        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit });

        const req = { body: { tenantId: 7 } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            creditController.unlockContact,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(rollback).toHaveBeenCalledTimes(1);
        expect(commit).not.toHaveBeenCalled();
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'tenantId and propertyId are required',
            message: 'tenantId and propertyId are required',
            code: 'CREDIT_UNLOCK_REQUIRED_FIELDS'
        });
    });

    it('rolls back and delegates unexpected unlockContact errors to centralized internal-error contract', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);
        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit });
        vi.spyOn(User, 'findByPk').mockRejectedValue(new Error('transactional query failed'));

        const req = { body: { tenantId: 7, propertyId: 20 } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            creditController.unlockContact,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(rollback).toHaveBeenCalledTimes(1);
        expect(commit).not.toHaveBeenCalled();
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
