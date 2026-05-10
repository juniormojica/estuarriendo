import { describe, expect, it, vi, afterEach } from 'vitest';
import * as userController from './userController.js';
import * as userService from '../services/userService.js';
import { badRequest, conflict, notFound } from '../errors/AppError.js';
import { errorHandler } from '../middleware/errorHandler.js';

const createResponse = ({ headersSent = false } = {}) => {
    const res = {};
    res.headersSent = headersSent;
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

    errorHandler(capturedError, req, res, vi.fn());
    return res;
};

describe('userController migrated flow -> errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns standard 400 JSON when createUser forwards validation AppError', async () => {
        vi.spyOn(userService, 'createUser').mockRejectedValue(
            badRequest('Missing required fields: email', { code: 'VALIDATION_ERROR' })
        );

        const req = { body: { name: 'Ana' } };
        const res = await runThroughErrorHandler(userController.createUser, { req });

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Missing required fields: email',
            message: 'Missing required fields: email',
            code: 'VALIDATION_ERROR'
        });
    });

    it('returns standard 404 JSON when getUserById forwards notFound AppError', async () => {
        vi.spyOn(userService, 'getUserById').mockRejectedValue(
            notFound('User not found', { code: 'USER_NOT_FOUND' })
        );

        const req = { params: { id: 'u-1' } };
        const res = await runThroughErrorHandler(userController.getUserById, { req });

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'User not found',
            message: 'User not found',
            code: 'USER_NOT_FOUND'
        });
    });

    it('returns standard 409 JSON when createUser forwards conflict AppError', async () => {
        vi.spyOn(userService, 'createUser').mockRejectedValue(
            conflict('User with this email already exists', { code: 'USER_CONFLICT' })
        );

        const req = { body: { email: 'ana@mail.com' } };
        const res = await runThroughErrorHandler(userController.createUser, { req });

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            error: 'User with this email already exists',
            message: 'User with this email already exists',
            code: 'USER_CONFLICT'
        });
    });

    it('delegates updateUser missing auth to standardized 401 contract', async () => {
        const req = {
            params: { id: 'u-1' },
            body: { name: 'Ana Updated' }
        };

        const res = await runThroughErrorHandler(userController.updateUser, { req });

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: 'No autenticado',
            message: 'No autenticado',
            code: 'USER_UPDATE_UNAUTHENTICATED'
        });
    });

    it('delegates updateUser cross-user write to standardized 403 contract', async () => {
        const req = {
            params: { id: 'u-2' },
            body: { name: 'Other User' },
            auth: { userId: 'u-1' }
        };

        const res = await runThroughErrorHandler(userController.updateUser, { req });

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: 'No tienes permiso para actualizar este perfil',
            message: 'No tienes permiso para actualizar este perfil',
            code: 'USER_UPDATE_FORBIDDEN'
        });
    });

    it('delegates updateUser invalid document pair to standardized 400 contract', async () => {
        const req = {
            params: { id: 'u-1' },
            body: { idType: 'CC' },
            auth: { userId: 'u-1' }
        };

        const res = await runThroughErrorHandler(userController.updateUser, { req });

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Debes completar tanto el tipo como el número de documento.',
            message: 'Debes completar tanto el tipo como el número de documento.',
            code: 'USER_UPDATE_DOCUMENT_PAIR_REQUIRED'
        });
    });
});

describe('incremental adoption boundary', () => {
    it('does not alter already-sent local responses from non-migrated style handlers', () => {
        const req = {};
        const res = createResponse({ headersSent: true });
        const next = vi.fn();
        const error = new Error('legacy handler error after local response');

        errorHandler(error, req, res, next);

        expect(next).toHaveBeenCalledWith(error);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});
