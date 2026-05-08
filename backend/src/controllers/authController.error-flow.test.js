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
        const res = await runThroughErrorHandler(authController.googleAuth, { req });

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Ya tienes una cuenta registrada con este correo. Por favor inicia sesión con tu contraseña.',
            message: 'Ya tienes una cuenta registrada con este correo. Por favor inicia sesión con tu contraseña.',
            code: 'AUTH_GOOGLE_EMAIL_CONFLICT'
        });
    });
});
