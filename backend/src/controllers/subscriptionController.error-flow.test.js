import { afterEach, describe, expect, it, vi } from 'vitest';
import * as subscriptionController from './subscriptionController.js';
import { Subscription, User } from '../models/index.js';
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

describe('subscriptionController incremental migration -> centralized errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('forwards getUserActiveSubscription unexpected errors to centralized errorHandler', async () => {
        vi.spyOn(Subscription, 'findOne').mockRejectedValue(new Error('query exploded'));

        const req = { auth: { userId: '1' }, params: { userId: '1' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            subscriptionController.getUserActiveSubscription,
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

    it('rejects cross-user subscription history access for non-admin with 403', async () => {
        vi.spyOn(User, 'findByPk').mockResolvedValue({ userType: UserType.TENANT });

        const req = { auth: { userId: 'attacker' }, params: { userId: 'victim' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            subscriptionController.getUserSubscriptionHistory,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: 'No tienes permiso para ver la información de suscripciones de este usuario',
            message: 'No tienes permiso para ver la información de suscripciones de este usuario',
            code: 'SUBSCRIPTION_HISTORY_FORBIDDEN'
        });
    });
});
