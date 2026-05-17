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

    it('fails closed with 401 when markAsRead is called without req.auth', async () => {
        vi.spyOn(Notification, 'findByPk').mockResolvedValue(null);

        const req = { params: { id: '404' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            notificationController.markAsRead,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Autenticación requerida',
            message: 'Autenticación requerida',
            code: 'NOTIFICATION_AUTH_REQUIRED'
        });
    });

    it('fails closed with 401 when deleteNotification is called without req.auth', async () => {
        vi.spyOn(Notification, 'findByPk').mockResolvedValue(null);

        const req = { params: { id: '404' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            notificationController.deleteNotification,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Autenticación requerida',
            message: 'Autenticación requerida',
            code: 'NOTIFICATION_AUTH_REQUIRED'
        });
    });

    it('fails closed with 401 when getUserNotifications is called without req.auth', async () => {
        vi.spyOn(Notification, 'findAll').mockRejectedValue(new Error('query exploded'));

        const req = { params: { userId: '1' }, query: {} };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            notificationController.getUserNotifications,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Autenticación requerida',
            message: 'Autenticación requerida',
            code: 'NOTIFICATION_AUTH_REQUIRED'
        });
    });
});

describe('notificationController owner authorization', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    const ownUserId = 'user-own-123';
    const otherUserId = 'user-other-456';
    const authedReq = (overrides = {}) => ({
        auth: { userId: ownUserId },
        params: {},
        query: {},
        body: {},
        ...overrides
    });

    // --- User-scoped routes (params.userId mismatch) ---

    it('getUserNotifications rejects cross-user access', async () => {
        const req = authedReq({ params: { userId: otherUserId } });
        const res = createResponse();
        const next = vi.fn();

        await notificationController.getUserNotifications(req, res, next);

        expect(next).toHaveBeenCalled();
        const err = next.mock.calls[0][0];
        expect(err.statusCode).toBe(403);
        expect(err.code).toBe('NOTIFICATION_ACCESS_DENIED');
    });

    it('getUserNotifications allows own-user access', async () => {
        vi.spyOn(Notification, 'findAll').mockResolvedValue([]);
        const req = authedReq({ params: { userId: ownUserId } });
        const res = createResponse();
        const next = vi.fn();

        await notificationController.getUserNotifications(req, res, next);

        expect(res.json).toHaveBeenCalledWith([]);
        expect(next).not.toHaveBeenCalled();
    });

    it('getUnreadCount rejects cross-user access', async () => {
        const req = authedReq({ params: { userId: otherUserId } });
        const res = createResponse();
        const next = vi.fn();

        await notificationController.getUnreadCount(req, res, next);

        expect(next).toHaveBeenCalled();
        const err = next.mock.calls[0][0];
        expect(err.statusCode).toBe(403);
        expect(err.code).toBe('NOTIFICATION_ACCESS_DENIED');
    });

    it('markAllAsRead rejects cross-user access', async () => {
        const req = authedReq({ params: { userId: otherUserId } });
        const res = createResponse();
        const next = vi.fn();

        await notificationController.markAllAsRead(req, res, next);

        expect(next).toHaveBeenCalled();
        const err = next.mock.calls[0][0];
        expect(err.statusCode).toBe(403);
        expect(err.code).toBe('NOTIFICATION_ACCESS_DENIED');
    });

    it('deleteAllRead rejects cross-user access', async () => {
        const req = authedReq({ params: { userId: otherUserId } });
        const res = createResponse();
        const next = vi.fn();

        await notificationController.deleteAllRead(req, res, next);

        expect(next).toHaveBeenCalled();
        const err = next.mock.calls[0][0];
        expect(err.statusCode).toBe(403);
        expect(err.code).toBe('NOTIFICATION_ACCESS_DENIED');
    });

    // --- Single-notification routes (ownership mismatch) ---

    it('markAsRead rejects notification owned by another user', async () => {
        vi.spyOn(Notification, 'findByPk').mockResolvedValue({
            id: 42,
            userId: otherUserId,
            update: vi.fn()
        });

        const req = authedReq({ params: { id: '42' } });
        const res = createResponse();
        const next = vi.fn();

        await notificationController.markAsRead(req, res, next);

        expect(next).toHaveBeenCalled();
        const err = next.mock.calls[0][0];
        expect(err.statusCode).toBe(403);
        expect(err.code).toBe('NOTIFICATION_ACCESS_DENIED');
    });

    it('markAsRead succeeds for own notification', async () => {
        const update = vi.fn();
        vi.spyOn(Notification, 'findByPk').mockResolvedValue({
            id: 42,
            userId: ownUserId,
            update
        });

        const req = authedReq({ params: { id: '42' } });
        const res = createResponse();
        const next = vi.fn();

        await notificationController.markAsRead(req, res, next);

        expect(update).toHaveBeenCalledWith({ read: true });
        expect(res.json).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('deleteNotification rejects notification owned by another user', async () => {
        vi.spyOn(Notification, 'findByPk').mockResolvedValue({
            id: 42,
            userId: otherUserId,
            destroy: vi.fn()
        });

        const req = authedReq({ params: { id: '42' } });
        const res = createResponse();
        const next = vi.fn();

        await notificationController.deleteNotification(req, res, next);

        expect(next).toHaveBeenCalled();
        const err = next.mock.calls[0][0];
        expect(err.statusCode).toBe(403);
        expect(err.code).toBe('NOTIFICATION_ACCESS_DENIED');
    });

    it('deleteNotification succeeds for own notification', async () => {
        const destroy = vi.fn();
        vi.spyOn(Notification, 'findByPk').mockResolvedValue({
            id: 42,
            userId: ownUserId,
            destroy
        });

        const req = authedReq({ params: { id: '42' } });
        const res = createResponse();
        const next = vi.fn();

        await notificationController.deleteNotification(req, res, next);

        expect(destroy).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });
});
