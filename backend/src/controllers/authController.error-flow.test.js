import { afterEach, describe, expect, it, vi } from 'vitest';
import * as authController from './authController.js';
import * as authService from '../services/authService.js';
import * as googleAuthService from '../services/googleAuthService.js';
import User from '../models/User.js';
import { ActivityLog } from '../models/index.js';
import { errorHandler } from '../middleware/errorHandler.js';

const createResponse = ({ headersSent = false } = {}) => {
    const res = {};
    res.headersSent = headersSent;
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    res.cookie = vi.fn(() => res);
    res.clearCookie = vi.fn(() => res);
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

describe('authController migrated flow -> errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns standard 401 JSON when login forwards expected service error', async () => {
        vi.spyOn(authService, 'login').mockRejectedValue(Object.assign(new Error('Credenciales inválidas'), { statusCode: 401 }));

        const req = { body: { email: 'ana@mail.com', password: '123456' } };
        const res = await runThroughErrorHandler(authController.login, { req });

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Credenciales inválidas',
            message: 'Credenciales inválidas',
            code: 'OPERATIONAL_ERROR'
        });
    });

    it('returns sanitized 500 JSON when register forwards unexpected error', async () => {
        vi.spyOn(authService, 'register').mockRejectedValue(new Error('SequelizeConnectionError: password=secret-token'));

        const req = {
            body: {
                name: 'Ana',
                email: 'ana@mail.com',
                password: '123456',
                phone: '111111111',
                userType: 'student'
            }
        };

        const res = await runThroughErrorHandler(authController.register, { req });

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });
});

describe('authController success-flow preservation', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('keeps login cookie and payload behavior on success', async () => {
        const serviceResult = {
            user: { id: 'u-1', email: 'ana@mail.com' },
            token: 'jwt-token-123'
        };

        vi.spyOn(authService, 'login').mockResolvedValue(serviceResult);

        const req = { body: { email: 'ana@mail.com', password: '123456' } };
        const res = createResponse();

        await authController.login(req, res, vi.fn());

        expect(res.cookie).toHaveBeenCalledWith(
            'estuarriendo_token',
            'jwt-token-123',
            expect.objectContaining({
                httpOnly: true,
                sameSite: 'lax',
                path: '/'
            })
        );
        expect(res.json).toHaveBeenCalledWith(serviceResult);
    });

    it('keeps register status, cookie and payload behavior on success', async () => {
        const serviceResult = {
            user: { id: 'u-10', name: 'Ana', userType: 'student' },
            token: 'register-jwt-token'
        };

        vi.spyOn(authService, 'register').mockResolvedValue(serviceResult);

        const activityCreateSpy = vi.spyOn(ActivityLog, 'create').mockResolvedValue({ id: 'log-1' });

        const req = {
            body: {
                name: 'Ana',
                email: 'ana@mail.com',
                password: '123456',
                phone: '111111111',
                userType: 'student'
            }
        };
        const res = createResponse();

        await authController.register(req, res, vi.fn());

        expect(activityCreateSpy).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.cookie).toHaveBeenCalledWith(
            'estuarriendo_token',
            'register-jwt-token',
            expect.objectContaining({
                httpOnly: true,
                sameSite: 'lax',
                path: '/'
            })
        );
        expect(res.json).toHaveBeenCalledWith(serviceResult);
    });

    it('keeps logout cookie clearing and payload behavior on success', async () => {
        const req = {};
        const res = createResponse();

        await authController.logout(req, res, vi.fn());

        expect(res.clearCookie).toHaveBeenCalledWith(
            'estuarriendo_token',
            expect.objectContaining({
                httpOnly: true,
                sameSite: 'lax',
                path: '/'
            })
        );
        expect(res.json).toHaveBeenCalledWith({ message: 'Sesión cerrada exitosamente' });
    });

    it('keeps resetPassword payload behavior on success', async () => {
        const serviceResult = { message: 'Contraseña actualizada exitosamente' };
        vi.spyOn(authService, 'resetPassword').mockResolvedValue(serviceResult);

        const req = { body: { token: 'reset-token', newPassword: 'new-password-123' } };
        const res = createResponse();

        await authController.resetPassword(req, res, vi.fn());

        expect(authService.resetPassword).toHaveBeenCalledWith('reset-token', 'new-password-123');
        expect(res.json).toHaveBeenCalledWith(serviceResult);
    });

    it('keeps google existing-user login cookie and payload behavior on success', async () => {
        vi.spyOn(googleAuthService, 'verifyGoogleToken').mockResolvedValue({
            googleId: 'google-200',
            email: 'ana@mail.com',
            name: 'Ana',
            picture: 'picture'
        });

        const existingUser = {
            id: 'u-google-1',
            toJSON: () => ({ id: 'u-google-1', email: 'ana@mail.com' })
        };

        vi.spyOn(User, 'findOne').mockResolvedValueOnce(existingUser);

        const req = { body: { credential: 'google-token-success' } };
        const res = createResponse();

        await authController.googleAuth(req, res, vi.fn());

        expect(res.cookie).toHaveBeenCalledWith(
            'estuarriendo_token',
            expect.any(String),
            expect.objectContaining({
                httpOnly: true,
                sameSite: 'lax',
                path: '/'
            })
        );
        expect(res.json).toHaveBeenCalledWith({
            user: { id: 'u-google-1', email: 'ana@mail.com' },
            token: expect.any(String)
        });
    });

    it('returns standardized conflict when google auth email already exists manually', async () => {
        vi.spyOn(googleAuthService, 'verifyGoogleToken').mockResolvedValue({
            googleId: 'google-1',
            email: 'ana@mail.com',
            name: 'Ana',
            picture: 'picture'
        });

        vi.spyOn(User, 'findOne')
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({ id: 'u-2', email: 'ana@mail.com', googleId: null });

        const req = { body: { credential: 'google-token' } };
        const res = await runThroughErrorHandler(authController.googleAuth, { req });

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Ya tienes una cuenta registrada con este correo. Por favor inicia sesión con tu contraseña.',
            message: 'Ya tienes una cuenta registrada con este correo. Por favor inicia sesión con tu contraseña.',
            code: 'AUTH_GOOGLE_EMAIL_CONFLICT'
        });
    });
});
