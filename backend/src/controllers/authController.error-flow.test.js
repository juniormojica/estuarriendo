import { afterEach, describe, expect, it, vi } from 'vitest';
import * as authController from './authController.js';
import * as authService from '../services/authService.js';
import * as googleAuthService from '../services/googleAuthService.js';
import User from '../models/User.js';
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

    const statusCallsBeforeHandler = res.status.mock.calls.length;
    const jsonCallsBeforeHandler = res.json.mock.calls.length;
    const cookieCallsBeforeHandler = res.cookie.mock.calls.length;

    errorHandler(capturedError, req, res, vi.fn());
    return {
        res,
        capturedError,
        statusCallsBeforeHandler,
        jsonCallsBeforeHandler,
        cookieCallsBeforeHandler
    };
};

describe('authController migrated flow -> errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns standard 401 JSON when login forwards expected service error', async () => {
        vi.spyOn(authService, 'login').mockRejectedValue(Object.assign(new Error('Credenciales inválidas'), { statusCode: 401 }));

        const req = { body: { email: 'ana@mail.com', password: '123456' } };
        const { res } = await runThroughErrorHandler(authController.login, { req });

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

        const { res: registerRes } = await runThroughErrorHandler(authController.register, { req });

        expect(registerRes.status).toHaveBeenCalledWith(500);
        expect(registerRes.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });

    it('delegates login missing credentials validation to standardized 400 contract and does not set cookie', async () => {
        const req = { body: { email: '', password: '' } };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler, cookieCallsBeforeHandler } = await runThroughErrorHandler(
            authController.login,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(cookieCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Correo electrónico o contraseña son requeridos',
            message: 'Correo electrónico o contraseña son requeridos',
            code: 'AUTH_LOGIN_REQUIRED_FIELDS'
        });
    });

    it('delegates register missing required fields to standardized 400 contract and does not set cookie', async () => {
        const req = { body: { name: 'Ana' } };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler, cookieCallsBeforeHandler } = await runThroughErrorHandler(
            authController.register,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(cookieCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Faltan campos obligatorios: name, email, password, phone, userType',
            message: 'Faltan campos obligatorios: name, email, password, phone, userType',
            code: 'AUTH_REGISTER_REQUIRED_FIELDS'
        });
    });

    it('delegates forgotPassword missing email validation to standardized 400 contract', async () => {
        const req = { body: {} };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            authController.forgotPassword,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Email es requerido',
            message: 'Email es requerido',
            code: 'AUTH_FORGOT_PASSWORD_EMAIL_REQUIRED'
        });
    });

    it('delegates resetPassword short-password validation to standardized 400 contract', async () => {
        const req = { body: { token: 'reset-token', newPassword: '123' } };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            authController.resetPassword,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'La contraseña debe tener al menos 6 caracteres',
            message: 'La contraseña debe tener al menos 6 caracteres',
            code: 'AUTH_RESET_PASSWORD_TOO_SHORT'
        });
    });
});

describe('authController google auth conflict error', () => {
    afterEach(() => {
        vi.restoreAllMocks();
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
        const { res, cookieCallsBeforeHandler } = await runThroughErrorHandler(authController.googleAuth, { req });

        expect(cookieCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Ya tienes una cuenta registrada con este correo. Por favor inicia sesión con tu contraseña.',
            message: 'Ya tienes una cuenta registrada con este correo. Por favor inicia sesión con tu contraseña.',
            code: 'AUTH_GOOGLE_EMAIL_CONFLICT'
        });
    });

    it('delegates googleCompleteRegistration missing required fields to standardized 400 contract and does not set cookie', async () => {
        const req = { body: { email: 'ana@mail.com' } };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler, cookieCallsBeforeHandler } = await runThroughErrorHandler(
            authController.googleCompleteRegistration,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(cookieCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Faltan campos obligatorios: googleId, email, userType, phone',
            message: 'Faltan campos obligatorios: googleId, email, userType, phone',
            code: 'AUTH_GOOGLE_COMPLETE_REQUIRED_FIELDS'
        });
    });

    it('delegates googleAuth missing credential validation to standardized 400 contract and does not set cookie', async () => {
        const req = { body: {} };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler, cookieCallsBeforeHandler } = await runThroughErrorHandler(
            authController.googleAuth,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(cookieCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Token de Google es requerido',
            message: 'Token de Google es requerido',
            code: 'AUTH_GOOGLE_TOKEN_REQUIRED'
        });
    });
});
