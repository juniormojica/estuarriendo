import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/env.js', () => ({
    env: Object.freeze({
        nodeEnv: 'test',
        port: 3001,
        allowedOrigins: ['http://localhost:5173'],
        jwt: Object.freeze({ secret: 'this-is-a-long-test-jwt-secret-32-chars-min', expiresIn: '7d' }),
        db: Object.freeze({ host: 'localhost', port: 5432, name: 'test', user: 'test', password: 'test' }),
        bootstrap: Object.freeze({ secret: 'test-configured-secret' }),
    }),
}));

import * as authController from './authController.js';
import * as authService from '../services/authService.js';
import * as googleAuthService from '../services/googleAuthService.js';
import User from '../models/User.js';
import { ActivityLog } from '../models/index.js';

const createResponse = () => {
    const res = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    res.cookie = vi.fn(() => res);
    res.clearCookie = vi.fn(() => res);
    return res;
};

const expectedSecure = process.env.NODE_ENV === 'production';

const expectedCookieOptions = {
    httpOnly: true,
    secure: expectedSecure,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/'
};

const expectedClearCookieOptions = {
    httpOnly: true,
    secure: expectedSecure,
    sameSite: 'lax',
    path: '/'
};

describe('authController success flow', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('login calls authService, sets cookie contract and returns payload', async () => {
        const serviceResult = {
            user: { id: 'u-1', email: 'ana@mail.com' },
            token: 'jwt-token-123'
        };
        const loginSpy = vi.spyOn(authService, 'login').mockResolvedValue(serviceResult);

        const req = { body: { email: 'ana@mail.com', password: '123456' } };
        const res = createResponse();

        await authController.login(req, res, vi.fn());

        expect(loginSpy).toHaveBeenCalledWith('ana@mail.com', '123456');
        expect(res.cookie).toHaveBeenCalledWith('estuarriendo_token', 'jwt-token-123', expectedCookieOptions);
        expect(res.json).toHaveBeenCalledWith(serviceResult);
    });

    it('register logs activity, sets cookie contract, returns 201 and payload', async () => {
        const serviceResult = {
            user: { id: 'u-10', name: 'Ana', userType: 'student' },
            token: 'register-jwt-token'
        };
        const registerSpy = vi.spyOn(authService, 'register').mockResolvedValue(serviceResult);
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

        expect(registerSpy).toHaveBeenCalledWith(req.body);
        expect(activityCreateSpy).toHaveBeenCalledTimes(1);
        expect(activityCreateSpy).toHaveBeenCalledWith(expect.objectContaining({
            type: 'user_registered',
            message: 'Nuevo usuario registrado: Ana (student)',
            userId: 'u-10'
        }));
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.cookie).toHaveBeenCalledWith('estuarriendo_token', 'register-jwt-token', expectedCookieOptions);
        expect(res.json).toHaveBeenCalledWith(serviceResult);
    });

    it('logout clears cookie contract and returns success message', async () => {
        const req = {};
        const res = createResponse();

        await authController.logout(req, res, vi.fn());

        expect(res.clearCookie).toHaveBeenCalledWith('estuarriendo_token', expectedClearCookieOptions);
        expect(res.json).toHaveBeenCalledWith({ message: 'Sesión cerrada exitosamente' });
    });

    it('getCurrentUser forwards request user id and returns user payload', async () => {
        const currentUser = { id: 'u-20', email: 'ana@mail.com' };
        const getUserSpy = vi.spyOn(authService, 'getUserById').mockResolvedValue(currentUser);

        const req = { userId: 'u-20' };
        const res = createResponse();

        await authController.getCurrentUser(req, res, vi.fn());

        expect(getUserSpy).toHaveBeenCalledWith('u-20');
        expect(res.json).toHaveBeenCalledWith(currentUser);
    });

    it('forgotPassword forwards email and returns service payload', async () => {
        const serviceResult = { message: 'Si el correo existe, se enviaron instrucciones.' };
        const forgotSpy = vi.spyOn(authService, 'requestPasswordReset').mockResolvedValue(serviceResult);

        const req = { body: { email: 'ana@mail.com' } };
        const res = createResponse();

        await authController.forgotPassword(req, res, vi.fn());

        expect(forgotSpy).toHaveBeenCalledWith('ana@mail.com');
        expect(res.json).toHaveBeenCalledWith(serviceResult);
    });

    it('verifyResetToken forwards route token and returns service payload', async () => {
        const serviceResult = { valid: true };
        const verifySpy = vi.spyOn(authService, 'verifyResetToken').mockResolvedValue(serviceResult);

        const req = { params: { token: 'reset-token' } };
        const res = createResponse();

        await authController.verifyResetToken(req, res, vi.fn());

        expect(verifySpy).toHaveBeenCalledWith('reset-token');
        expect(res.json).toHaveBeenCalledWith(serviceResult);
    });

    it('resetPassword forwards token and password and returns service payload', async () => {
        const serviceResult = { message: 'Contraseña actualizada exitosamente' };
        const resetSpy = vi.spyOn(authService, 'resetPassword').mockResolvedValue(serviceResult);

        const req = { body: { token: 'reset-token', newPassword: 'new-password-123' } };
        const res = createResponse();

        await authController.resetPassword(req, res, vi.fn());

        expect(resetSpy).toHaveBeenCalledWith('reset-token', 'new-password-123');
        expect(res.json).toHaveBeenCalledWith(serviceResult);
    });

    it('googleAuth existing-user sets cookie and returns user with token', async () => {
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

        expect(res.cookie).toHaveBeenCalledWith('estuarriendo_token', expect.any(String), expectedCookieOptions);
        expect(res.json).toHaveBeenCalledWith({
            user: { id: 'u-google-1', email: 'ana@mail.com' },
            token: expect.any(String)
        });
    });

    it('googleAuth new-user returns needsRegistration payload', async () => {
        vi.spyOn(googleAuthService, 'verifyGoogleToken').mockResolvedValue({
            googleId: 'google-new',
            email: 'new@mail.com',
            name: 'New User',
            picture: 'new-picture'
        });

        vi.spyOn(User, 'findOne')
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(null);

        const req = { body: { credential: 'google-token-new-user' } };
        const res = createResponse();

        await authController.googleAuth(req, res, vi.fn());

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            needsRegistration: true,
            googleData: {
                googleId: 'google-new',
                email: 'new@mail.com',
                name: 'New User',
                picture: 'new-picture'
            }
        });
    });

    it('googleCompleteRegistration forwards data, sets cookie, returns 201 and payload', async () => {
        const serviceResult = {
            user: { id: 'u-google-new', email: 'new@mail.com' },
            token: 'google-register-token'
        };
        const createGoogleUserSpy = vi.spyOn(authService, 'createGoogleUser').mockResolvedValue(serviceResult);

        const req = {
            body: {
                googleId: 'google-new',
                email: 'new@mail.com',
                name: 'New User',
                picture: 'new-picture',
                userType: 'student',
                phone: '111111111',
                whatsapp: '111111111'
            }
        };
        const res = createResponse();

        await authController.googleCompleteRegistration(req, res, vi.fn());

        expect(createGoogleUserSpy).toHaveBeenCalledWith(
            {
                googleId: 'google-new',
                email: 'new@mail.com',
                name: 'New User',
                picture: 'new-picture'
            },
            'student',
            '111111111',
            '111111111'
        );
        expect(res.cookie).toHaveBeenCalledWith('estuarriendo_token', 'google-register-token', expectedCookieOptions);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(serviceResult);
    });

    it('bootstrapFirstSuperAdmin creates superadmin, logs activity, sets cookie, returns 201 with no password leakage', async () => {
        const serviceResult = {
            user: { id: 'u-bootstrap-1', name: 'Admin', email: 'admin@test.com', userType: 'super_admin' },
            token: 'bootstrap-jwt-token'
        };
        const bootstrapSpy = vi.spyOn(authService, 'bootstrapFirstSuperAdmin').mockResolvedValue(serviceResult);
        const activityCreateSpy = vi.spyOn(ActivityLog, 'create').mockResolvedValue({ id: 'log-1' });

        const req = {
            body: { name: 'Admin', email: 'admin@test.com', password: 'secure123', phone: '3000000000' },
            headers: { 'x-bootstrap-secret': 'super-secret-bootstrap' }
        };
        const res = createResponse();

        await authController.bootstrapFirstSuperAdmin(req, res, vi.fn());

        expect(bootstrapSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Admin',
                email: 'admin@test.com',
                password: 'secure123',
                phone: '3000000000'
            }),
            'super-secret-bootstrap',
            'test-configured-secret'
        );
        expect(activityCreateSpy).toHaveBeenCalledTimes(1);
        expect(activityCreateSpy).toHaveBeenCalledWith(expect.objectContaining({
            type: 'user_registered',
            message: 'Superadmin bootstrap: Admin',
            userId: 'u-bootstrap-1'
        }));
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.cookie).toHaveBeenCalledWith('estuarriendo_token', 'bootstrap-jwt-token', expectedCookieOptions);
        expect(res.json).toHaveBeenCalledWith(serviceResult);
    });
});
