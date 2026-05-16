import { afterEach, describe, expect, it, vi } from 'vitest';
import * as creditController from './creditController.js';
import { CreditBalance, User } from '../models/index.js';
import { sequelize } from '../config/database.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { UserType } from '../utils/enums.js';

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

        const req = { auth: { userId: '1' }, params: { userId: '1' } };
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

        const req = { auth: { userId: '7' }, body: {} };
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
            error: 'propertyId is required',
            message: 'propertyId is required',
            code: 'CREDIT_UNLOCK_REQUIRED_FIELDS'
        });
    });

    it('delegates getCreditBalance cross-user access to standardized 403 contract', async () => {
        vi.spyOn(User, 'findByPk').mockResolvedValue({ userType: UserType.TENANT });

        const req = { auth: { userId: 'attacker' }, params: { userId: 'victim' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            creditController.getCreditBalance,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: 'No tienes permiso para acceder a esta información de créditos',
            message: 'No tienes permiso para acceder a esta información de créditos',
            code: 'CREDIT_BALANCE_FORBIDDEN'
        });
    });

    it('uses authenticated user id for unlockContact even if tenantId is supplied in body', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);
        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit });
        const findByPkSpy = vi.spyOn(User, 'findByPk').mockRejectedValue(new Error('stop after tenant lookup'));

        const req = { auth: { userId: 'auth-user' }, body: { tenantId: 'victim-user', propertyId: 20 } };
        await runThroughErrorHandler(creditController.unlockContact, { req });

        expect(findByPkSpy).toHaveBeenCalledWith('auth-user', expect.any(Object));
    });

    it('rolls back and delegates unexpected unlockContact errors to centralized internal-error contract', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);
        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit });
        vi.spyOn(User, 'findByPk').mockRejectedValue(new Error('transactional query failed'));

        const req = { auth: { userId: '7' }, body: { tenantId: 7, propertyId: 20 } };
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
