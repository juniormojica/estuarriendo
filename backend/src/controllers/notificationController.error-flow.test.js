import { afterEach, describe, expect, it, vi } from 'vitest';
import * as notificationController from './notificationController.js';
import { Notification, User } from '../models/index.js';
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

describe('notificationController incremental migration -> centralized errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('delegates create missing-user flow to centralized handler', async () => {
        vi.spyOn(User, 'findByPk').mockResolvedValue(null);

        const req = {
            body: {
                userId: 999,
                type: 'MESSAGE',
                title: 'Title',
                message: 'Body'
            }
        };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            notificationController.createNotification,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'User not found',
            message: 'User not found',
            code: 'NOTIFICATION_USER_NOT_FOUND'
        });
    });

    it('delegates create required-fields validation to centralized handler', async () => {
        const req = {
            body: {
                userId: 999,
                type: 'MESSAGE',
                title: 'Title'
            }
        };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            notificationController.createNotification,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'userId, type, title, and message are required',
            message: 'userId, type, title, and message are required',
            code: 'NOTIFICATION_REQUIRED_FIELDS_MISSING'
        });
    });

    it('delegates create unexpected errors to centralized internal-error contract', async () => {
        vi.spyOn(User, 'findByPk').mockResolvedValue({ id: 1 });
        vi.spyOn(Notification, 'create').mockRejectedValue(new Error('insert exploded'));

        const req = {
            body: {
                userId: 1,
                type: 'MESSAGE',
                title: 'Title',
                message: 'Body'
            }
        };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            notificationController.createNotification,
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

    it('delegates markAsRead missing-notification flow to centralized handler', async () => {
        vi.spyOn(Notification, 'findByPk').mockResolvedValue(null);

        const req = { params: { id: '404' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            notificationController.markAsRead,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Notification not found',
            message: 'Notification not found',
            code: 'NOTIFICATION_NOT_FOUND'
        });
    });

    it('delegates deleteNotification missing-notification flow to centralized handler', async () => {
        vi.spyOn(Notification, 'findByPk').mockResolvedValue(null);

        const req = { params: { id: '404' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            notificationController.deleteNotification,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Notification not found',
            message: 'Notification not found',
            code: 'NOTIFICATION_NOT_FOUND'
        });
    });

    it('delegates getUserNotifications unexpected errors to centralized internal-error contract', async () => {
        vi.spyOn(Notification, 'findAll').mockRejectedValue(new Error('query exploded'));

        const req = { params: { userId: '1' }, query: {} };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            notificationController.getUserNotifications,
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
