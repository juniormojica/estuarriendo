import { beforeEach, describe, expect, it, vi } from 'vitest';

const { verifyIdToken } = vi.hoisted(() => ({
    verifyIdToken: vi.fn()
}));

vi.mock('google-auth-library', () => ({
    OAuth2Client: vi.fn(() => ({
        verifyIdToken
    }))
}));

import { verifyGoogleToken } from './googleAuthService.js';

describe('googleAuthService semantic errors', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.GOOGLE_CLIENT_ID = 'google-client-id';
    });

    it('throws AUTH_GOOGLE_TOKEN_INVALID when Google payload is missing', async () => {
        verifyIdToken.mockResolvedValueOnce({
            getPayload: () => null
        });

        await expect(verifyGoogleToken('credential-token')).rejects.toMatchObject({
            name: 'AppError',
            statusCode: 401,
            code: 'AUTH_GOOGLE_TOKEN_INVALID',
            message: 'Token de Google inválido'
        });
    });

    it('throws AUTH_GOOGLE_EMAIL_NOT_VERIFIED when Google email is not verified', async () => {
        verifyIdToken.mockResolvedValueOnce({
            getPayload: () => ({
                email_verified: false
            })
        });

        await expect(verifyGoogleToken('credential-token')).rejects.toMatchObject({
            name: 'AppError',
            statusCode: 401,
            code: 'AUTH_GOOGLE_EMAIL_NOT_VERIFIED',
            message: 'El correo de Google no está verificado'
        });
    });

    it('throws AUTH_GOOGLE_TOKEN_VERIFICATION_FAILED when Google verification throws', async () => {
        verifyIdToken.mockRejectedValueOnce(new Error('google verification failed'));

        await expect(verifyGoogleToken('credential-token')).rejects.toMatchObject({
            name: 'AppError',
            statusCode: 401,
            code: 'AUTH_GOOGLE_TOKEN_VERIFICATION_FAILED',
            message: 'No se pudo verificar el token de Google'
        });
    });

    it('returns mapped profile data for valid Google payload', async () => {
        verifyIdToken.mockResolvedValueOnce({
            getPayload: () => ({
                sub: 'google-123',
                email: 'test@example.com',
                name: 'Test User',
                picture: 'https://example.com/pic.jpg',
                email_verified: true
            })
        });

        await expect(verifyGoogleToken('credential-token')).resolves.toEqual({
            googleId: 'google-123',
            email: 'test@example.com',
            name: 'Test User',
            picture: 'https://example.com/pic.jpg',
            emailVerified: true
        });
    });
});
